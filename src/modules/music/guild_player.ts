import {
  AudioPlayerError,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice"
import { ChannelType, Guild, GuildMember, Message, TextChannel, User } from "discord.js"
import { PlayerMessageHandler } from "./player_message_handler"
import { BasePlayer } from "./base_player"
import { PlayerInteractiveMessage } from "./player_interactive_message"
import { YoutubeProvider } from "./providers/youtube"
import { logger } from "../../utils/logger"
import { UserInteraction } from "../../commands/userInteraction"
import { PlayCommandOptions } from "../../commands/music/play"
import Track from "./track"
import TrackSearcher from "./track_searcher"
import { SoundcloudProvider } from "./providers/soundcloud"

class GuildPlayer extends BasePlayer {
  public audioPlayer = createAudioPlayer({ debug: process.env.NODE_ENV === "development" })
  public interactiveMessage?: PlayerInteractiveMessage
  private _volume = 0
  private _voiceConnection: VoiceConnection
  private _audioResource: AudioResource | null = null
  private _messageHandler: PlayerMessageHandler = new PlayerMessageHandler()
  private _skipped = false
  private _textChannel: TextChannel

  constructor(public guild: Guild) {
    super()

    this._volume = this.guild.db.volume

    this.on("trackAdd", (track: Track) => this._messageHandler.trackAdd(track))
    this.on("jump", (track) => this._messageHandler.jump(track))
    this.on("volumeChange", (track, oldVol, newVol) =>
      this._messageHandler.volumeChange(track, oldVol, newVol)
    )
    this.on("clearQueue", () => this._messageHandler.clearQueue())
    this.on("playing", (track) => this._messageHandler.playing(track))
    this.on("pause", (track) => this._messageHandler.pause(track))
    this.on("resume", (track) => this._messageHandler.resume(track))
    this.on("playlistAdd", (track) => this._messageHandler.playlistAdd(track))
    this.on("error", (track) => this._messageHandler.error(track))

    this.audioPlayer.on(AudioPlayerStatus.Playing, () =>
      this._onAudioPlayerPlaying(this.queue.playingNow)
    )
    this.audioPlayer.on(AudioPlayerStatus.Idle, () => this._onAudioPlayerIdle())
    this.audioPlayer.on("error", (err) => this._onAudioPlayerError(err))

    this._setInteractiveMessage()
  }

  public get volume() {
    return this._volume
  }

  public async playOnVoiceChannel(userInteraction: UserInteraction<PlayCommandOptions, Message>) {
    userInteraction.deferReply()

    let tracks: Track[]
    try {
      const { nome: query } = userInteraction.options
      const author = userInteraction.interaction.member as GuildMember

      tracks = await this.searchAndAddToQueue(query, {
        requester: author.user as User,
        userInteraction,
      })
    } catch (err) {
      this.emit("error", err)

      return
    }

    if (tracks.length > 1) this.emit("playlistAdd", tracks)
    if (tracks.length === 1) this.emit("trackAdd", tracks[0])
    if (this.playing) return
    if (userInteraction.interaction.channel.type === ChannelType.GuildText) {
      this._textChannel = userInteraction.interaction.channel
      this._messageHandler.setTextChannel(this._textChannel)
    }

    this.playing = true
    this._joinVoiceChannel(userInteraction)
    this._voiceConnection.subscribe(this.audioPlayer)
    this._playStream()
  }

  public async setVolume(vol: number) {
    if (typeof vol !== "number") throw new Error("Volume must be a numeric type")
    if (vol < 0) throw new Error("Volume must be major than 0")
    if (!this._audioResource) throw new Error("AudioResource not found")
    if (!this._audioResource.volume) throw new Error("AudioResource.volume not found")

    const oldVol = this._volume
    this._volume = vol
    this._audioResource.volume.setVolumeLogarithmic(vol / 100)
    this.emit("volumeChange", this.queue.playingNow, oldVol, vol)
  }

  public pause() {
    this.audioPlayer.pause()
    this.playing = false
    this.emit("pause", this.queue.playingNow)
  }

  public resume() {
    this.audioPlayer.unpause()
    this.playing = true
    this.emit("resume", this.queue.playingNow)
  }

  public jump(to = 1) {
    const track = super.jump(to)
    this.audioPlayer.stop()
    this._skipped = true
    return track
  }

  private _joinVoiceChannel(cmd: UserInteraction) {
    const voiceState = (cmd.interaction.member as GuildMember).voice

    if (!voiceState.channel) throw new Error("Voice channel not found")

    const connection = joinVoiceChannel({
      channelId: voiceState.channel.id,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
    })

    this._voiceConnection = connection
    this._voiceConnection.on("stateChange", (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected && this.playing) this.stop()
    })
  }

  private async _playStream() {
    const track = this.queue.playingNow
    try {
      const stream = await this.play().catch(async (err) => {
        logger.error(err)
        return await this._trackStreamErrorHandler(track)
      })

      if (!stream) return

      this._audioResource = createAudioResource(stream, {
        inlineVolume: true,
        inputType: StreamType.WebmOpus,
      })

      if (!this._audioResource.volume) throw new Error("AudioResource.volume not found")

      this._audioResource.volume.setVolumeLogarithmic(this.volume / 100)
    } catch (error) {
      logger.error(error)

      this._textChannel.send(" :bangbang: **|** Erro ao tocar a música")

      if (this.queue.tracks.length > 1) this.jump()
      else this.disconnect()

      return
    }

    this.audioPlayer.play(this._audioResource)
  }

  private _onAudioPlayerPlaying(track: Track) {
    if (!track.thumbnail || !track.author) return
    this.emit("playing", track)
  }

  private _onAudioPlayerError(err: AudioPlayerError) {
    if (err.message === "Premature close" && process.env.NODE_ENV !== "development") return

    logger.error(err)
  }

  private _onAudioPlayerIdle() {
    this.audioFilters = []

    if (!this.repeat && !this._skipped) this.queue.next()
    this._skipped = false
    if (this.queue.empty) return this.disconnect()
    if (this.shuffle && !this.repeat) this.queue.setRandomTrackToFirst()

    this._playStream()
  }

  public disconnect() {
    this.emit("finish")
    this._voiceConnection.disconnect()
  }

  public async reloadInteractiveMessage() {
    this.interactiveMessage?.disable()
    await this._setInteractiveMessage()
  }

  private async _setInteractiveMessage() {
    if (!this.guild.db.playerChannel?.ch && !this.guild.db.playerChannel?.ch) return

    try {
      const interactiveChannel = (await this.guild.client.channels.fetch(
        this.guild.db.playerChannel.ch
      )) as TextChannel
      const interactiveMessage = await interactiveChannel.messages.fetch(
        this.guild.db.playerChannel.msg
      )

      this.interactiveMessage = new PlayerInteractiveMessage(interactiveMessage, this)
    } catch (error) {}
  }

  private async _trackStreamErrorHandler(track: Track) {
    if (track.provider instanceof YoutubeProvider) {
      const scTrack = await TrackSearcher.search(
        track.searchQuery,
        track.metadata,
        new SoundcloudProvider()
      )

      if (scTrack.length === 0)
        throw new Error(`Cannot find track stream with ${track.searchQuery} on soundcloud query`)

      return scTrack[0].stream()
    }

    throw new Error(`Cannot handle track stream with ${track.searchQuery} query`)
  }
}

export default GuildPlayer
