import { InteractionOptionType } from "../../types/global"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"
import { isOnVoiceChannel } from "../../utils/isOnVoiceChannel"
import { queueExistsOnGuild } from "../../utils/queueExistsOnGuild"

export type SkipCommandOptions = {
  numero?: number
}
export default class SkipCommand extends BaseCommand {
  constructor() {
    super({
      name: "skip",
      alias: "next",
      description: "Pula a musica atual",
      options: [
        {
          name: "numero",
          description:
            "Numero da musica para pular, caso nao seja informado ira pular para proxima",
          type: InteractionOptionType.INTEGER,
        },
      ],
      before: [isOnVoiceChannel, queueExistsOnGuild],
    })
  }

  public async run(userInteraction: UserInteraction<SkipCommandOptions>): Promise<any> {
    const { player } = userInteraction.interaction.guild
    let { numero: index } = userInteraction.options

    index = +index - 1

    if (index && index >= 1) {
      if (index >= player.queue.tracks.length)
        return userInteraction.reply(":warning: **|** Argumento invalido")

      player.jump(index)

      return
    }

    player.jump()
  }
}
