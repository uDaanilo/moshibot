import { Command } from "../types"

export default function (msg: Command): boolean {
  if (msg.guild.player && !msg.guild.player.queue.empty) return true

  return false
}
