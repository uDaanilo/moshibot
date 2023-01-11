import { describe, expect, it } from "vitest"
import { YoutubeProvider } from "../../src/modules/music/providers/youtube"
import { trackDefined } from "../utils"

describe("youtube provider tests suite", () => {
  it("should return exactly 1 track", async () => {
    const tracks = await new YoutubeProvider().search("venom extreme")
    const track = tracks[0]

    expect(tracks.length).toBe(1)
    trackDefined(track)
  })

  it("should return exactly 5 tracks", async () => {
    const tracks = await new YoutubeProvider().searchByKeyword("venom extreme", 5)

    expect(tracks.length).toBe(5)

    for (const track of tracks) trackDefined(track)
  })

  it("should be able to get track by url", async () => {
    const tracks = await new YoutubeProvider().getByUrl(
      "https://music.youtube.com/watch?v=x-eHQVtnRfs"
    )
    const track = tracks[0]

    expect(tracks.length).toBe(1)
    trackDefined(track)
  })

  it("should be able to get a playlist", async () => {
    const tracks = await new YoutubeProvider().getPlaylistByUrl(
      "https://music.youtube.com/playlist?list=OLAK5uy_mz6eafmqdRHSaR4IwG0ll6J6rgv0_ZpGw"
    )

    expect(tracks.length).toBeGreaterThan(1)
    for (const track of tracks) trackDefined(track)
  })
})
