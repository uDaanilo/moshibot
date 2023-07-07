import { EventEmitter } from "events"
import TypedEmitter from "typed-emitter"
import Track from "./track"

export type PlayerEvents = {
  playing: (track: Track) => void
  trackAdd: (track: Track) => void
  volumeChange: (track: Track, oldVol: number, newVol: number) => void
  clearQueue: () => void
  pause: (track: Track) => void
  resume: (track: Track) => void
  playlistAdd: (tracks: Track[]) => void
  repeat: (track: Track) => void
  shuffle: (track: Track) => void
  jump: (track: Track) => void
  error: (err: unknown) => void
  finish: () => void
}

export class PlayerEventEmitter extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {}
