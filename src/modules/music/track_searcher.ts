import Track, { TrackBase, TrackMetadata } from "./track"
import { YoutubeProvider } from "./providers/youtube"
import { SoundcloudProvider } from "./providers/soundcloud"
import { SpotifyProvider } from "./providers/spotify"
import ArbitraryProvider from "./providers/arbitrary"
import { logger } from "../../utils/logger"

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

  private static buildTrack(tracksBase: TrackBase[], provider, metadata: TrackMetadata): Track[] {
    return tracksBase.map(
      (track) =>
        new Track({
          ...track,
          provider,
          metadata,
        })
    )
  }

  static async search(
    query: string,
    metadata: TrackMetadata,
    provider?: (typeof this.providers)[number]
  ): Promise<Track[]> {
    const tracks: Track[] = []

    if (provider) {
      const foundTracks = await provider.search(query)
      logger.info(
        `Found ${foundTracks.length} tracks with query ${query} on ${provider.constructor.name} provider`
      )

      tracks.push(...this.buildTrack(foundTracks, provider, metadata))
    } else {
      for (const provider of this.providers) {
        for (const pattern of provider.urlPattern) {
          if (pattern.test(query)) {
            const foundTracks = await provider.search(query)
            logger.info(
              `Found ${foundTracks.length} tracks with query ${query} on ${provider.constructor.name} provider`
            )

            tracks.push(...this.buildTrack(foundTracks, provider, metadata))

            break
          }
        }

        if (tracks.length) break
      }
    }

    return tracks
  }
}

export default TrackSearcher
