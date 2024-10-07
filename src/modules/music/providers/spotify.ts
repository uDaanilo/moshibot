import Spotify from "spotify-url-info"
import YouTube from "youtube-sr"
import { TrackBase } from "../track"
import { BaseProvider } from "./base"
import { isUrl } from "./helpers"
import { Readable } from "stream"
import fetch from "node-fetch"
import { YoutubeProvider } from "./youtube"

interface Artist {
  name: string
  uri: string
}

interface CoverArt {
  extractedColors: {
    colorDark: {
      hex: string
    }
    colorLight: {
      hex: string
    }
  }
  sources: Array<{
    width: number
    height: number
    url: string
  }>
}

interface SpotifyData {
  type: "track"
  name: string
  uri: string
  id: string
  title: string
  artists: Artist[]
  coverArt: CoverArt
  releaseDate: {
    isoString: string
  }
  duration: number
  maxDuration: number
  isPlayable: boolean
  isExplicit: boolean
  audioPreview: {
    url: string
    format: string
  }
  hasVideo: boolean
  relatedEntityUri: string
  external_urls: {
    spotify: string
  }
}

export class SpotifyProvider implements BaseProvider {
  public defaultProvider: boolean = false
  public urlPattern = [/spotify\.com/, /open\.spotify\.com/]

  public async search(query: string): Promise<TrackBase[]> {
    if (isUrl(query)) {
      if (query.includes("album") || query.includes("playlist") || query.includes("artist"))
        return this.getPlaylistByUrl(query)

      return this.getByUrl(query)
    }

    return []
  }

  public searchByKeyword(keyword: string): Promise<TrackBase[]> {
    return new Promise((resolve) => resolve([]))
  }

  public async getByUrl(url: string): Promise<TrackBase[]> {
    try {
      const spotifyTrack: SpotifyData = await Spotify(fetch).getData(url)

      const youtubeTrack = await YouTube.searchOne(
        `${spotifyTrack.name} ${spotifyTrack.artists[0].name}`,
        "video"
      )

      return [
        {
          title: youtubeTrack.title ?? "Unknown title",
          searchQuery: url,
          url: youtubeTrack.url,
          duration: youtubeTrack.duration / 1000,
          author: spotifyTrack.artists[0].name,
          thumbnail: spotifyTrack.coverArt.sources[0].url,
        },
      ]
    } catch (err) {
      if (err instanceof Error && err.message === "Cannot read property 'children' of undefined")
        return []

      throw err
    }
  }

  public async getPlaylistByUrl(url: string): Promise<TrackBase[]> {
    try {
      const spotifyTracks = await Spotify(fetch).getTracks(url)

      const tracks = await Promise.all(
        spotifyTracks.map(async (track) => {
          const youtubeTrack = await YouTube.searchOne(`${track.name} ${track.artist}`)

          return {
            title: youtubeTrack.title,
            searchQuery: url,
            url: youtubeTrack.url,
            duration: youtubeTrack.duration / 1000,
            author: track.artist,
            thumbnail: youtubeTrack.thumbnail?.displayThumbnailURL(),
          }
        })
      )

      return tracks
    } catch (err) {
      if (err instanceof Error && err.message === "Cannot read property 'children' of undefined")
        return []

      throw err
    }
  }

  public async getStreamByUrl(url: string): Promise<Readable> {
    return new YoutubeProvider().getStreamByUrl(url)
  }
}
