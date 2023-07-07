import Track from "./track"
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
import {
  ChannelType,
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  StringSelectMenuInteraction,
  TextChannel,
  User,
} from "discord.js"
import { PlayerMessageHandler } from "./player_message_handler"
import { BasePlayer } from "./base_player"
import { Command } from "../../types"
import { PlayerInteractiveMessage } from "./player_interactive_message"
import { YoutubeProvider } from "./providers/youtube"
import { isUrl } from "./providers/helpers"
import TrackSearcher from "./track_searcher"
import { logger } from "../../utils/logger"

class GuildPlayer extends BasePlayer {
  public audioPlayer = createAudioPlayer({ debug: process.env.NODE_ENV === "development" })
  public interactiveMessage?: PlayerInteractiveMessage
  private _volume = 0
  private _voiceConnection: VoiceConnection
  private _audioResource: AudioResource = null
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

    this._setInteractiveMessage()
  }

  public get volume() {
    return this._volume
  }

  public async playOnVoiceChannel(msg: Command) {
    if (msg.canDeferReply()) msg.deferReply()

    let tracks: Track[]
    try {
      let query = ""
      if (msg instanceof Message) query = msg.args
      else if (msg instanceof CommandInteraction) query = msg.options.get("nome").value as string
      else if (msg instanceof StringSelectMenuInteraction) query = msg.values[0]

      tracks = await this.searchAndAddToQueue(query, {
        requester: msg.member.user as User,
        command: msg,
      })
    } catch (err) {
      this.emit("error", err)

      return
    }

    if (tracks.length > 1) this.emit("playlistAdd", tracks)
    if (tracks.length === 1) this.emit("trackAdd", tracks[0])
    if (!this.playing) {
      if (msg.channel.type === ChannelType.GuildText) {
        this._textChannel = msg.channel
        this._messageHandler.setTextChannel(this._textChannel)
      }

      this.playing = true
      this._joinVoiceChannel(msg)
      this._voiceConnection.subscribe(this.audioPlayer)
      this._playStream(msg)
    }
  }

  public async setVolume(vol: number) {
    if (typeof vol !== "number") throw new Error("Volume must be a numeric type")
    if (vol < 0) throw new Error("Volume must be major than 0")

    const oldVol = this._volume
    this._volume = vol
    this._audioResource.volume.setVolumeLogarithmic(vol / 100)
    this.emit("volumeChange", this.queue.playingNow, oldVol, vol)
  }

  public pause() {
    this.audioPlayer.pause()
    this.emit("pause", this.queue.playingNow)
  }

  public resume() {
    this.audioPlayer.unpause()

    this.emit("resume", this.queue.playingNow)
  }

  public jump(to = 1) {
    const track = super.jump(to)
    this.audioPlayer.stop()
    this._skipped = true
    return track
  }

  private _joinVoiceChannel(msg: Command) {
    const voiceState = (msg.member as GuildMember).voice
    const connection = joinVoiceChannel({
      channelId: voiceState.channel.id,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
    })

    this._voiceConnection = connection
    this._voiceConnection.on("stateChange", (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected && this.playing) this.disconnect()
    })
  }

  private async _playStream(msg: Command) {
    const track = this.queue.playingNow
    const stream = await this.play().catch(async (err) => {
      logger.error(err)
      return await this._trackStreamErrorHandler(track)
    })

    this._audioResource = createAudioResource(stream, {
      inlineVolume: true,
      inputType: StreamType.WebmOpus,
    })
    this._audioResource.volume.setVolumeLogarithmic(this.volume / 100)

    this.audioPlayer.play(this._audioResource)

    this.audioPlayer.once(AudioPlayerStatus.Playing, () => this._onAudioPlayerPlaying(track))
    this.audioPlayer.once(AudioPlayerStatus.Idle, () => this._onAudioPlayerIdle(msg))
    this.audioPlayer.once("error", (err) => this._onAudioPlayerError(err))
  }

  private _onAudioPlayerPlaying(track: Track) {
    if (!track.thumbnail || !track.author) return
    this.emit("playing", track)
  }

  private _onAudioPlayerError(err: AudioPlayerError) {
    if (err.message === "Premature close" && process.env.NODE_ENV !== "development") return

    logger.error(err)
  }

  private _onAudioPlayerIdle(msg: Command) {
    this.audioFilters = null

    if (!this.repeat && !this._skipped) this.queue.next()
    this._skipped = false
    if (this.queue.empty) return this.disconnect()
    if (this.shuffle && !this.repeat) this.queue.setRandomTrackToFirst()

    this._playStream(msg)
  }

  public disconnect() {
    this.emit("finish")
    this.stop()
    this._voiceConnection.disconnect()
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
    if (track.provider instanceof YoutubeProvider && !isUrl(track.searchQuery)) {
      const scTrack = await TrackSearcher.search(track.searchQuery + " --sc", track.metadata)

      return await scTrack[0].stream()
    }
  }
}

export default GuildPlayer
