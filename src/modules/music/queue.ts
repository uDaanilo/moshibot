import formatDuration from "../../utils/formatDuration"
import Track from "./track"

class Queue {
  private _data: Track[] = []

  public get playingLast() {
    return this._data.length <= 1
  }

  public get empty() {
    return !this._data.length
  }

  public get nowPlaying() {
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
      this._data = this._data.concat(track)
      return
    }

    this._data.push(track)
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
