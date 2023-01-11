import { TrackBase } from "../track"
import { Readable } from "stream"

export abstract class BaseProvider {
  abstract readonly defaultProvider: boolean
  abstract readonly urlPattern: RegExp[]

  abstract search(query: string): Promise<TrackBase[]>
  abstract searchByKeyword(keyword: string): Promise<TrackBase[]>
  abstract getByUrl(url: string): Promise<TrackBase[]>
  abstract getPlaylistByUrl(url: string): Promise<TrackBase[]>
  abstract getStreamByUrl(url: string): Promise<Readable>
}
