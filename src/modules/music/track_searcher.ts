import { CommandInteraction, Message, StringSelectMenuInteraction } from "discord.js"
import Track, { TrackBase } from "./track"
import { YoutubeProvider } from "./providers/youtube"
import { SoundcloudProvider } from "./providers/soundcloud"
import { SpotifyProvider } from "./providers/spotify"
import { Command } from "../../types"
import ArbitraryProvider from "./providers/arbitrary"
import { logger } from "../../utils/logger"

function trackBuilder(tracksBase: TrackBase[], provider, msg, requester): Track[] {
  return tracksBase.map(
    (track) =>
      new Track({
        ...track,
        msg,
        provider,
        requester,
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

  static async search(msg: Command): Promise<Track[]> {
    const tracks: Track[] = []
    let query: string = ""

    if (msg instanceof Message) query = msg.args
    else if (msg instanceof CommandInteraction) query = msg.options.get("nome").value as string
    else if (msg instanceof StringSelectMenuInteraction) query = msg.values[0]

    for (const provider of this.providers) {
      for (const pattern of provider.urlPattern) {
        if (pattern.test(query)) {
          const foundTracks = await provider.search(query)
          logger.info(
            `Found ${foundTracks.length} tracks with query ${query} on ${provider.constructor.name} provider`
          )

          tracks.push(...trackBuilder(foundTracks, provider, msg, msg.member.user))

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
