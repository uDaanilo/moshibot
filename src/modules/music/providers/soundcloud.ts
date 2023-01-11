import { SoundCloud, Track } from "scdl-core"
import { Readable } from "stream"
import { TrackBase } from "../track"
import { BaseProvider } from "./base"

export class SoundcloudProvider implements BaseProvider {
  public defaultProvider: boolean = false
  public urlPattern = [/--sc$/, /soundcloud\.com/]

  public async search(query: string): Promise<TrackBase[]> {
    query = this.sanitizeQuery(query)

    if (query.startsWith("http")) {
      if (query.includes("sets")) return this.getPlaylistByUrl(query)

      return this.getByUrl(query)
    }

    return this.searchByKeyword(query)
  }

  private sanitizeQuery(query) {
    return query.split("--sc")[0].trim()
  }

  public async searchByKeyword(keyword: string): Promise<TrackBase[]> {
    await SoundCloud.connect()

    const scTracks = (await SoundCloud.search({ query: keyword, filter: "tracks", limit: 1 }))
      .collection

    if (!scTracks.length) return []

    const tracks = scTracks.map((track: Track) => ({
      author: track.user.username,
      duration: track.duration / 1000,
      searchQuery: keyword,
      thumbnail: this._formatArtworkurl(track.artwork_url),
      title: track.title,
      url: track.permalink_url,
    }))

    return tracks
  }

  public async getByUrl(url: string): Promise<TrackBase[]> {
    await SoundCloud.connect()

    const track = await SoundCloud.tracks.getTrack(url)

    track.artwork_url = this._formatArtworkurl(track.artwork_url)

    return [
      {
        author: track.user.username,
        duration: track.duration / 1000,
        searchQuery: url,
        thumbnail: track.artwork_url,
        title: track.title,
        url: track.permalink_url,
      },
    ]
  }

  public async getPlaylistByUrl(url: string): Promise<TrackBase[]> {
    await SoundCloud.connect()

    const playlist = await SoundCloud.playlists.getPlaylist(url)

    const tracks = playlist.tracks.map((track) => ({
      author: track.user.username,
      duration: track.duration / 1000,
      searchQuery: url,
      thumbnail: this._formatArtworkurl(track.artwork_url),
      title: track.title,
      url: track.permalink_url,
    }))

    return tracks
  }

  public async getStreamByUrl(url: string): Promise<Readable> {
    await SoundCloud.connect()

    return SoundCloud.download(url)
  }

  private _formatArtworkurl(url) {
    return url && url.replace("large", "t500x500")
  }
}
