import { describe, expect, it } from "vitest"
import { SpotifyProvider } from "../../src/modules/music/providers/spotify"
import { trackDefined } from "../utils"

describe("spotify provider tests suite", () => {
  it("should return exactly 1 track", async () => {
    const tracks = await new SpotifyProvider().search(
      "https://open.spotify.com/track/0RAlCmKZUxET9LeNtTdMAg?si=322176df000a409e"
    )
    const track = tracks[0]

    expect(tracks.length).toBe(1)
    trackDefined(track)
  })

  it("should be able to get a playlist", async () => {
    const tracks = await new SpotifyProvider().getPlaylistByUrl(
      "https://open.spotify.com/album/2EyfWmuiBm8ExLvog3Yk0P?si=ef247c5c4aaa4536"
    )

    expect(tracks.length).toBeGreaterThan(1)
    for (const track of tracks) trackDefined(track)
  })
})
