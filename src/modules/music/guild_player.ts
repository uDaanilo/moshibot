import Track from "./track"
import {
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
} from "@discordjs/voice"
import {
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  StringSelectMenuInteraction,
  TextChannel,
  User,
} from "discord.js"
import { PlayerController } from "./player_controller"
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
  public guild: Guild
  public volume = 0
  private _controller = new PlayerController(this)
  private _voiceConnection: VoiceConnection
  private _audioResource: AudioResource = null
  private _messageHandler = new PlayerMessageHandler()

  constructor(guild: Guild) {
    super()

    this.guild = guild
    this.volume = this.guild.db.volume

    this.on("trackAdd", this._messageHandler.trackAdd)
    this.on("jump", this._messageHandler.jump)
    this.on("volumeChange", this._messageHandler.volumeChange)
    this.on("clearQueue", this._messageHandler.clearQueue)
    this.on("playing", this._messageHandler.playing)
    this.on("pause", this._messageHandler.pause)
    this.on("resume", this._messageHandler.resume)
    this.on("playlistAdd", this._messageHandler.playlistAdd)
    this.on("error", this._messageHandler.error)

    this._setInteractiveMessage()
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
      this.emit("error", msg, err)

      return
    }

    if (tracks.length > 1) this.emit("playlistAdd", msg, tracks)
    if (tracks.length === 1) this.emit("trackAdd", msg, tracks[0])
    if (!this.playing) {
      this.playing = true
      this._joinVoiceChannel(msg)
      this._voiceConnection.subscribe(this.audioPlayer)

      this._playStream(msg)
    }
  }

  public stop(msg?: Command, shouldReply = true) {
    this._controller.stop()
    this.emit("clearQueue", msg, shouldReply)
  }

  public async setVolume(msg: Command, vol: number, shouldReply = true) {
    const oldVol = this.volume
    this._controller.setVolume(vol)
    this._audioResource.volume.setVolumeLogarithmic(vol / 100)
    this.emit("volumeChange", msg, oldVol, vol, shouldReply)
  }

  public pause(msg: Command, shouldReply = true) {
    this._controller.pause()
    this.emit("pause", msg, shouldReply)
  }

  public resume(msg: Command, shouldReply = true) {
    this._controller.resume()
    this.emit("resume", msg, shouldReply)
  }

  public jump(msg: Command, to: number = 1, shouldReply = true) {
    const track = this._controller.jump(to)
    this.emit("jump", msg, track, shouldReply)
  }

  public toggleRepeat(msg: Command, shouldReply = true) {
    this._controller.toggleRepeat()
    this.emit("repeat", msg, shouldReply)
  }

  public toggleShuffle(msg: Command, shouldReply = true) {
    this._controller.toggleShuffle()
    this.emit("shuffle", msg, shouldReply)
  }

  private _joinVoiceChannel(msg: Command) {
    const voiceState = (msg.member as GuildMember).voice
    const connection = joinVoiceChannel({
      channelId: voiceState.channel.id,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator,
    })

    this._voiceConnection = connection
  }

  private async _playStream(msg: Command) {
    const track = this.queue.nowPlaying
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

    this.audioPlayer.once(AudioPlayerStatus.Playing, () => this._onAudioPlayerPlaying(track, msg))
    this.audioPlayer.once(AudioPlayerStatus.Idle, () => this._onAudioPlayerIdle(msg))
  }

  private _onAudioPlayerPlaying(track: Track, msg: Command) {
    if (!track.thumbnail || !track.author) return
    this.emit("playing", msg, track)
  }

  private _onAudioPlayerIdle(msg: Command) {
    this.audioFilters = null

    if (!this.repeat) this.queue.next()
    if (this.queue.empty) {
      this.emit("finish")

      this._controller.stop()
      this._voiceConnection.disconnect()

      return
    }

    if (this.shuffle && !this.repeat) this.queue.setRandomTrackToFirst()

    this._playStream(msg)
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
