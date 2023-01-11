import { Guild } from "discord.js"
import { PlayerEventEmitter } from "./player_event_emitter"

export class BasePlayer extends PlayerEventEmitter {
  constructor(public guild: Guild) {
    super()
  }
}
