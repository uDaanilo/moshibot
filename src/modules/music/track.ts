import ffmpeg from "fluent-ffmpeg"
import { Message, User } from "discord.js"
import { Readable, PassThrough } from "stream"
import { YoutubeProvider } from "./providers/youtube"
import { SoundcloudProvider } from "./providers/soundcloud"
import { SpotifyProvider } from "./providers/spotify"

export interface TrackBase {
  title: string
  searchQuery: string
  url: string
  duration: number
  thumbnail: string
  author: string
}

class Track {
  public readonly title: string
  public readonly searchQuery: string
  public readonly url: string
  public readonly duration: number
  public readonly thumbnail: string
  public readonly author: string
  public readonly requester: User
  public readonly msg: Message
  public readonly provider: YoutubeProvider | SoundcloudProvider | SpotifyProvider
  public readonly stream: (filter?, seek?) => Promise<Readable | PassThrough>

  constructor({ title, searchQuery, url, duration, thumbnail, author, requester, msg, provider }) {
    this.title = title
    this.searchQuery = searchQuery
    this.url = url
    this.duration = duration
    this.thumbnail = thumbnail
    this.author = author
    this.requester = requester
    this.msg = msg
    this.provider = provider
    this.stream = async () => this.encode(await provider.getStreamByUrl(url))
  }

  private encode(stream: Readable, filters?: string, seek?: number) {
    const out = ffmpeg(stream)
      .audioCodec("libopus")
      .toFormat("opus")
      .on("error", (err) => {
        if (err.message === "Output stream error: Premature close") return

        console.error(err)
      })

    if (filters) out.withAudioFilter(filters)
    if (seek) out.seek(seek)

    return out.pipe() as PassThrough
  }
}

export default Track
