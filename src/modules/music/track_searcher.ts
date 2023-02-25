import Track, { TrackBase, TrackMetadata } from "./track"
import { YoutubeProvider } from "./providers/youtube"
import { SoundcloudProvider } from "./providers/soundcloud"
import { SpotifyProvider } from "./providers/spotify"
import ArbitraryProvider from "./providers/arbitrary"
import { logger } from "../../utils/logger"

function trackBuilder(tracksBase: TrackBase[], provider, metadata: TrackMetadata): Track[] {
  return tracksBase.map(
    (track) =>
      new Track({
        ...track,
        provider,
        metadata,
      })
  )
}

export class TrackNotfound extends Error {
  constructor() {
    super()

    Object.setPrototypeOf(this, TrackNotfound.prototype)
  }
}

class TrackSearcher {
  static readonly providers = [
    new SpotifyProvider(),
    new SoundcloudProvider(),
    new YoutubeProvider(),
    new ArbitraryProvider(),
  ]

  static async search(query: string, metadata: TrackMetadata): Promise<Track[]> {
    const tracks: Track[] = []

    for (const provider of this.providers) {
      for (const pattern of provider.urlPattern) {
        if (pattern.test(query)) {
          const foundTracks = await provider.search(query)
          logger.info(
            `Found ${foundTracks.length} tracks with query ${query} on ${provider.constructor.name} provider`
          )

          tracks.push(...trackBuilder(foundTracks, provider, metadata))

          break
        }
      }

      if (tracks.length) break
    }

    if (!tracks.length) throw new TrackNotfound()

    return tracks
  }
}

export default TrackSearcher
