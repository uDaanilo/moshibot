import { isOnVoiceChannel } from "../../utils/isOnVoiceChannel"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"

export default class StopCommand extends BaseCommand {
  constructor() {
    super({
      name: "stop",
      description: "Para a musica e sai do canal de voz",
      before: [isOnVoiceChannel],
    })
  }

  async run(userInteraction: UserInteraction) {
    userInteraction.interaction.guild.player.disconnect()
  }
}
