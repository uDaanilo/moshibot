import { PlayerEventEmitter } from "./player_event_emitter"
import { Queue } from "./queue"
import Track, { TrackMetadata } from "./track"
import TrackSearcher from "./track_searcher"

export class BasePlayer extends PlayerEventEmitter {
  public queue = new Queue()
  public playing = false
  public shuffle = false
  public repeat = false
  public audioFilters: string[] = []

  public async play() {
    const stream = await this.queue.nowPlaying.stream()

    return stream
  }

  public async searchAndAddToQueue(query: string, metadata: TrackMetadata = {}) {
    const tracks: Track[] = await TrackSearcher.search(query, metadata)

    this.queue.add(tracks)

    return tracks
  }
}
