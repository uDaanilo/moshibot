import ffmpeg from "fluent-ffmpeg"
import { Message, User } from "discord.js"
import { Readable, PassThrough } from "stream"
import { YoutubeProvider } from "./providers/youtube"
import { SoundcloudProvider } from "./providers/soundcloud"
import { SpotifyProvider } from "./providers/spotify"
import { logger } from "../../utils/logger"
import { UserInteraction } from "../../commands/userInteraction"

export interface TrackBase {
  title: string
  searchQuery: string
  url: string
  duration: number
  thumbnail: string
  author: string
}

export interface TrackMetadata {
  requester?: User
  msg?: Message
  userInteraction?: UserInteraction
  [k: string]: any
}

class Track {
  public readonly title: string
  public readonly searchQuery: string
  public readonly url: string
  public readonly duration: number
  public readonly thumbnail: string
  public readonly author: string
  public readonly provider: YoutubeProvider | SoundcloudProvider | SpotifyProvider
  public readonly metadata: TrackMetadata
  public readonly stream: (filter?, seek?) => Promise<Readable | PassThrough>

  constructor({
    title,
    searchQuery,
    url,
    duration,
    thumbnail,
    author,
    provider,
    metadata,
  }: TrackBase & {
    provider: YoutubeProvider | SoundcloudProvider | SpotifyProvider
    metadata: TrackMetadata
  }) {
    this.title = title
    this.searchQuery = searchQuery
    this.url = url
    this.duration = duration
    this.thumbnail = thumbnail
    this.author = author
    this.provider = provider
    this.metadata = metadata

    this.stream = async () => this.encode(await provider.getStreamByUrl(url))
  }

  private encode(stream: Readable, filters?: string, seek?: number) {
    const out = ffmpeg(stream)
      .audioCodec("libopus")
      .toFormat("opus")
      .on("error", (err) => {
        if (err.message !== "Output stream closed") logger.error(err)

        stream.destroy()
        out.kill("SIGKILL")
      })

    if (filters) out.withAudioFilter(filters)
    if (seek) out.seek(seek)

    return out.pipe() as PassThrough
  }
}

export default Track
