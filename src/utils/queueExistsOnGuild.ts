import { BeforeCommand } from "../commands/baseCommand"
import { UserInteraction } from "../commands/userInteraction"

export default function (interaction: UserInteraction["interaction"]): boolean {
  if (interaction.guild?.player && !interaction.guild.player.queue.empty) return true

  return false
}

export const queueExistsOnGuild: BeforeCommand = (userInteraction: UserInteraction) => {
  if (
    userInteraction.interaction.guild?.player &&
    !userInteraction.interaction.guild.player.queue.empty
  )
    return true

  userInteraction.reply(
    ":warning: **|** Não há nenhuma música na playlist para poder executar esta ação"
  )
  return false
}
