import { describe, expect, test } from "vitest"
import { Queue } from "../src/modules/music/queue"
import Track from "../src/modules/music/track"
import { YoutubeProvider } from "../src/modules/music/providers/youtube"

describe("queue test suite", () => {
  test("should add a track to queue", () => {
    const [track] = trackFactory()
    const queue = new Queue()

    queue.add(track)

    expect(queue.tracks.length).toBe(1)
  })

  test("should throw a error when add a invalid track to queue", () => {
    const track = {} as Track
    const queue = new Queue()

    expect(() => queue.add(track)).toThrowError()
  })

  test("should throw a error when add a invalid tracks to queue", () => {
    const tracks = [{}, {}] as Track[]
    const queue = new Queue()

    expect(() => queue.add(tracks)).toThrowError()
  })

  test("should clear queue tracks", () => {
    const tracks = trackFactory(2)
    const queue = new Queue()

    expect(queue.empty).toBeTruthy()

    queue.add(tracks)

    expect(queue.tracks.length).toBe(2)

    queue.clear()

    expect(queue.empty).toBeTruthy()
  })

  test("should jump to third track on queue", () => {
    const tracks = trackFactory(5)
    const queue = new Queue()

    queue.add(tracks)

    queue.jumpTo(3)
    expect(queue.playingNow.title).toBe("3")
  })

  test("should jump to next track on queue", () => {
    const tracks = trackFactory(2)
    const queue = new Queue()

    queue.add(tracks)

    expect(queue.playingNow.title).toBe("0")

    queue.next()

    expect(queue.playingNow.title).toBe("1")
  })
})

function trackFactory(qty = 1): Track[] {
  const tracks: Track[] = []

  for (let i = 0; i < qty; i++) {
    tracks.push(
      new Track({
        title: `${i}`,
        url: "",
        author: "",
        duration: Math.round(Math.random() * 10),
        provider: new YoutubeProvider(),
        searchQuery: "",
        thumbnail: "",
        metadata: {},
      })
    )
  }

  return tracks
}
