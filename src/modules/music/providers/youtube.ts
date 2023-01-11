import YouTube from "youtube-sr"
import { TrackBase } from "../track"
import { BaseProvider } from "./base"
import { Readable } from "stream"
import YoutubeDlp from "../../../services/ytdlp"

export class YoutubeProvider implements BaseProvider {
  public readonly defaultProvider: boolean = false
  public readonly urlPattern = [
    /music\.youtube\.com/,
    /youtube\.com/,
    /www\.youtube\.com/,
    /youtu\.be/,
    /^((?!https?).)*$/,
  ]

  public async search(query: string): Promise<TrackBase[]> {
    if (query.startsWith("http")) {
      if (query.includes("playlist")) return this.getPlaylistByUrl(query)

      return this.getByUrl(query)
    }

    return this.searchByKeyword(query)
  }

  public async searchByKeyword(keyword: string, limit = 1): Promise<TrackBase[]> {
    const videosInfo = await YouTube.search(keyword, { type: "video", limit })

    if (!videosInfo.length) return []

    const tracks = videosInfo.map((video) => ({
      title: video.title,
      searchQuery: keyword,
      url: video.url,
      author: video.channel.name,
      duration: video.duration / 1000,
      thumbnail: video.thumbnail.displayThumbnailURL("maxresdefault"),
    }))

    return tracks
  }

  public async getByUrl(url: string): Promise<TrackBase[]> {
    const videoInfo = await YoutubeDlp.getInfo(url)

    if (!videoInfo) return []

    return [
      {
        title: videoInfo.title,
        searchQuery: url,
        url: videoInfo.url ?? videoInfo.original_url,
        author: videoInfo.artist ?? videoInfo.uploader,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnails.pop().url,
      },
    ]
  }

  public async getPlaylistByUrl(url: string): Promise<TrackBase[]> {
    const playlistInfo = await YouTube.getPlaylist(url).then((p) => p.fetch())

    if (!playlistInfo) return []

    const tracks = playlistInfo.videos.map((v) => ({
      title: v.title,
      searchQuery: url,
      url: v.url,
      author: v.channel.name,
      duration: v.duration / 1000,
      thumbnail: v.thumbnail.displayThumbnailURL("maxresdefault"),
    }))

    return tracks
  }

  public async getStreamByUrl(url: string): Promise<Readable> {
    return YoutubeDlp.download(url)
  }
}
