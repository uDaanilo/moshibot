import { TrackBase } from "../track"
import { BaseProvider } from "./base"
import { Readable } from "node:stream"
import YoutubeDlp, { Playlist } from "../../../services/ytdlp"

class ArbitraryProvider implements BaseProvider {
  public readonly defaultProvider: boolean = false
  public readonly urlPattern = [
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
  ]

  public async search(query: string): Promise<TrackBase[]> {
    return this.getByUrl(query)
  }

  public async searchByKeyword(keyword: string, limit = 1): Promise<TrackBase[]> {
    return []
  }

  public async getByUrl(url: string): Promise<TrackBase[]> {
    const data = await YoutubeDlp.getInfo(url)

    if (!data) return []

    if (data._type === "playlist") {
      const entries = data.entries as Playlist["entries"]

      return entries.map((t) => ({
        title: t.title,
        searchQuery: url,
        url: t.webpage_url,
        author: t.artist ?? t.uploader,
        duration: t.duration || 0,
        thumbnail: t.thumbnail,
      }))
    }

    return [
      {
        title: data.title,
        searchQuery: url,
        url: data.webpage_url,
        author: data.artist ?? data.uploader,
        duration: data.duration || 0,
        thumbnail: data.thumbnail,
      },
    ]
  }

  public async getPlaylistByUrl(url: string): Promise<TrackBase[]> {
    return []
  }

  public async getStreamByUrl(url: string): Promise<Readable> {
    return YoutubeDlp.download(url)
  }
}

export default ArbitraryProvider
