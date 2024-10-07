import { PlayerEventEmitter } from "./player_event_emitter"
import { Queue } from "./queue"
import Track, { TrackMetadata } from "./track"
import TrackSearcher from "./track_searcher"
import { Readable, PassThrough } from "node:stream"

export class BasePlayer extends PlayerEventEmitter {
  public queue = new Queue()
  public playing = false
  public shuffle = false
  public repeat = false
  public audioFilters: string[] = []
  private _currentAudioStream: Readable | PassThrough | null = null

  public get currentAudioStream() {
    return this._currentAudioStream
  }

  public async play() {
    const stream = await this.queue.playingNow.stream()

    this._currentAudioStream = stream
    return stream
  }

  public async searchAndAddToQueue(query: string, metadata: TrackMetadata = {}) {
    const tracks: Track[] = await TrackSearcher.search(query, metadata)

    this.queue.add(tracks)

    return tracks
  }

  public stop() {
    this.playing = false
    this.queue.clear()
    this._currentAudioStream?.destroy()
    this.emit("clearQueue")
  }

  public pause() {
    this.playing = false
    this._currentAudioStream?.pause()
    this.emit("pause", this.queue.playingNow)
  }

  public resume() {
    this.playing = true
    this._currentAudioStream?.resume()
    this.emit("resume", this.queue.playingNow)
  }

  public jump(to: number = 1) {
    if (this.queue.tracks.length < to) return

    this.queue.jumpTo(to)
    this._currentAudioStream?.destroy()
    this.emit("jump", this.queue.playingNow)
    return this.queue.tracks[1]
  }

  public toggleRepeat() {
    this.repeat = !this.repeat
    this.emit("repeat", this.queue.playingNow)
  }

  public toggleShuffle() {
    this.shuffle = !this.shuffle
    this.emit("shuffle", this.queue.playingNow)
  }
}
