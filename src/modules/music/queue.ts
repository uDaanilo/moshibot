import formatDuration from "../../utils/formatDuration"
import Track from "./track"

class Queue {
  private _data: Track[] = []

  public get isPlayingLast() {
    return this._data.length === 1
  }

  public get empty() {
    return !this._data.length
  }

  public get playingNow() {
    return this._data[0]
  }

  public get tracks() {
    return this._data
  }

  public get totalDuration() {
    const queueTotalDuration = this._data.reduce((prev, curr) => {
      const currDuration = curr.duration || 0

      return prev + currDuration
    }, 0)

    return formatDuration(queueTotalDuration)
  }

  public add(track: Track | Track[]) {
    if (Array.isArray(track)) {
      this.bulkAdd(track)
      return
    }

    if (!(track instanceof Track)) throw new Error("Invalid track")

    this._data.push(track)
  }

  public bulkAdd(tracks: Track[]) {
    tracks.forEach((t, i) => {
      if (!(t instanceof Track)) throw new Error(`Invalid track at index ${i}`)
    })

    this._data = this._data.concat(tracks)
  }

  public clear() {
    this._data = []
  }

  public jumpTo(index: number) {
    this._data = this._data.slice(index)
  }

  public next() {
    return this._data.shift()
  }

  public setRandomTrackToFirst() {
    const rng = parseInt((Math.random() * (this._data.length - 1)).toString())
    this._data.unshift(this._data[rng])
    this._data.splice(rng + 1, 1)
  }
}

export { Queue }
