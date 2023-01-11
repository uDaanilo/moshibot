import childProcess from "child_process"

export type Format = {
  format_id: string
  url: string
  ext: string
  vcodec: string
  acodec: string
  abr: number
  protocol: "https" | "http"
  audio_ext: string
  video_ext: string
  format: string
  resolution: string
  http_headers: Record<string, any>
}

export type Thumbnail = {
  url: string
  id: string
}

export interface YTDLPData {
  id: string
  title: string
  thumbnail: string
  uploader: string
  uploader_url: string
  timestamp: number
  release_timestamp: number
  duration: number
  track: string
  track_number: number
  track_id: string
  artist: string
  album: string
  formats: Format[]
  webpage_url: string
  original_url: string
  webpage_url_basename: string
  webpage_url_domain: string
  extractor: string
  extractor_key: string
  playlist?: []
  playlist_index?: string
  thumbnails: Thumbnail[]
  display_id: string
  upload_date: string
  release_date: string
  requested_subtitles?: string
  _has_drm?: boolean
  format_id: string
  url: string
  ext: string
  vcodec: string
  acodec: string
  abr: number
  protocol: "https" | "http"
  audio_ext: string
  video_ext: string
  format: string
  resolution: string
  http_headers: Record<string, string>
  epoch: number
  _filename: string
  filename: string
  urls: string
  entries: []
  _type: string
  _version: {
    version: string
    current_git_head?: string
    release_git_head: string
    repository: string
  }
}

export interface Playlist {
  _type: "playlist"
  uploader_id: string
  id: string
  title: string
  description: string
  entries: YTDLPData[]
}

class YoutubeDlp {
  static ytdlp(args) {
    if (process.env.NODE_ENV !== "development") args.push("-q")

    return childProcess.spawn("yt-dlp", args)
  }

  static async getInfo(url: string): Promise<YTDLPData> {
    const { stdout } = this.ytdlp(["-J", url])

    return new Promise<YTDLPData>((resolve) => {
      let data = ""
      stdout.on("data", (chunk) => {
        data += chunk.toString()
      })

      stdout.on("close", () => {
        resolve(JSON.parse(data.toString()))
      })
    })
  }

  static async download(url: string) {
    const args = ["--buffer-size", "16K", "-o", "-", url]
    const { stdout, stderr } = this.ytdlp(args)

    stderr.on("data", (chunk) => console.error(chunk.toString()))

    return stdout
  }
}

export default YoutubeDlp
