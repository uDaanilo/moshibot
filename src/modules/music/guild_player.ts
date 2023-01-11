import TrackSearcher from "./track_searcher"
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
import { Guild, GuildMember, TextChannel } from "discord.js"
import { PlayerController } from "./player_controller"
import { PlayerMessageHandler } from "./player_message_handler"
import { BasePlayer } from "./base_player"
import { Command } from "../../types"
import { PlayerInteractiveMessage } from "./player_interactive_message"
import { Queue } from "./queue"

class GuildPlayer extends BasePlayer {
  public queue = new Queue()
  public volume = 50
  public playing = false
  public shuffle = false
  public repeat = false
  public audioFilters: string[] = []
  public audioPlayer = createAudioPlayer({ debug: process.env.NODE_ENV === "development" })
  public playerMessage?: PlayerInteractiveMessage
  private _controller = new PlayerController(this)
  private _voiceConnection: VoiceConnection
  private _audioResource: AudioResource = null
  private _messageHandler = new PlayerMessageHandler()

  constructor(guild: Guild) {
    super(guild)

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

    this._hasInteractiveMessage()
  }

  public async play(msg: Command) {
    if (msg.canDeferReply()) msg.deferReply()

    let tracks: Track[]
    try {
      tracks = await TrackSearcher.search(msg)
    } catch (err) {
      this.emit("error", msg, err)

      return
    }

    if (tracks.length > 1) this.emit("playlistAdd", msg, tracks)

    if (!this.queue.empty) {
      if (tracks.length === 1) this.emit("trackAdd", msg, tracks[0])
      this.queue.add(tracks)

      return
    } else {
      this.queue.add(tracks)

      this._joinVoiceChannel(msg)
      this.playing = true
      this._voiceConnection.subscribe(this.audioPlayer)
    }

    this._playStream(msg)
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
    const stream = await track.stream()

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
    if (this.queue.playingLast) {
      this.emit("finish")

      this._controller.stop()
      this._voiceConnection.disconnect()

      return
    }

    if (this.shuffle && !this.repeat) this.queue.setRandomTrackToFirst()

    this._playStream(msg)
  }

  private async _hasInteractiveMessage() {
    if (!this.guild.db.playerChannel?.ch && !this.guild.db.playerChannel?.ch) return false

    try {
      const interactiveChannel = (await this.guild.client.channels.fetch(
        this.guild.db.playerChannel.ch
      )) as TextChannel
      const interactiveMessage = await interactiveChannel.messages.fetch(
        this.guild.db.playerChannel.msg
      )

      this.playerMessage = new PlayerInteractiveMessage(interactiveMessage, this)

      return true
    } catch (error) {}

    return false
  }
}

export default GuildPlayer
