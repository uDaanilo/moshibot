import { GuildMember } from "discord.js"
import { Command } from "../types"

export default function (msg: Command) {
  if ((msg.member as GuildMember).voice.channel) return true

  return false
}
