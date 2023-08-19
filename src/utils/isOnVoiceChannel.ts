import { GuildMember } from "discord.js"
import { UserInteraction } from "../commands/userInteraction"
import { BeforeCommand } from "../commands/baseCommand"

export default function (interaction: UserInteraction["interaction"]) {
  if ((interaction.member as GuildMember).voice.channel) return true

  return false
}

export const isOnVoiceChannel: BeforeCommand = (userInteraction: UserInteraction) => {
  const guildMember = userInteraction.interaction.member as GuildMember
  if (guildMember.voice.channel) return true

  userInteraction.reply(":warning: **|** Você deve entrar em um canal de voz primeiro")
  return false
}
