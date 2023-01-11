import { describe, expect, it } from "vitest"
import ArbitraryProvider from "../../src/modules/music/providers/arbitrary"
import { trackDefined } from "../utils"

describe("spotify provider tests suite", () => {
  it("should return exactly 1 track", async () => {
    const tracks = await new ArbitraryProvider().search("https://yuce0903.bandcamp.com/track/pump")
    const track = tracks[0]

    expect(tracks.length).toBe(1)
    trackDefined(track)
  })

  it("should be able to get a track by url", async () => {
    const tracks = await new ArbitraryProvider().getByUrl(
      "https://yuce0903.bandcamp.com/album/future-c-ke"
    )

    expect(tracks.length).toBeGreaterThan(1)
    for (const track of tracks) trackDefined(track)
  })
})
