import { expect } from "vitest"
import { TrackBase } from "../src/modules/music/track"

export const trackDefined = (track: TrackBase) => {
  expect(track.title).toBeDefined()
  expect(track.author).toBeDefined()
  expect(track.duration).toBeDefined()
  expect(track.url).toBeDefined()
  expect(track.thumbnail).toBeDefined()
}
