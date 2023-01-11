import { EventEmitter } from "events"
import TypedEmitter from "typed-emitter"
import { Command } from "../../types"
import Track from "./track"

export type PlayerEvents = {
  playing: (msg: Command, track: Track, shouldReply?: boolean) => void
  finish: () => void
  trackAdd: (msg: Command, track: Track, shouldReply?: boolean) => void
  volumeChange: (msg: Command, oldVol: number, newVol: number, shouldReply?: boolean) => void
  clearQueue: (msg: Command, shouldReply?: boolean) => void
  pause: (msg: Command, shouldReply?: boolean) => void
  resume: (msg: Command, shouldReply?: boolean) => void
  playlistAdd: (msg: Command, tracks: Track[], shouldReply?: boolean) => void
  repeat: (msg: Command, shouldReply?: boolean) => void
  shuffle: (msg: Command, shouldReply?: boolean) => void
  jump: (msg: Command, track: Track, shouldReply?: boolean) => void
  error: (msg: Command, err: any) => void
}

export class PlayerEventEmitter extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {}
