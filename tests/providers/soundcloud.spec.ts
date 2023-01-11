import { describe, expect, it } from "vitest"
import { SoundcloudProvider } from "../../src/modules/music/providers/soundcloud"
import { trackDefined } from "../utils"

describe("soundcloud provider tests suite", () => {
  it("should return exactly 1 track", async () => {
    const tracks = await new SoundcloudProvider().search("nanahira")
    const track = tracks[0]

    expect(tracks.length).toBe(1)
    trackDefined(track)
  })

  it("should be able to get track by url", async () => {
    const tracks = await new SoundcloudProvider().getByUrl(
      "https://soundcloud.com/kamelcamellia/ctcd-012-crystallized-xfaded-demo"
    )
    const track = tracks[0]

    expect(tracks.length).toBe(1)
    trackDefined(track)
  })

  it("should be able to get a playlist", async () => {
    const tracks = await new SoundcloudProvider().getPlaylistByUrl(
      "https://soundcloud.com/snowshoo/sets/snowshoo-ep"
    )

    expect(tracks.length).toBeGreaterThan(1)
    for (const track of tracks) trackDefined(track)
  })
})
