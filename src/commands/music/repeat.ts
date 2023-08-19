import { isOnVoiceChannel } from "../../utils/isOnVoiceChannel"
import { queueExistsOnGuild } from "../../utils/queueExistsOnGuild"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"

export default class RepeatCommand extends BaseCommand {
  constructor() {
    super({
      name: "repeat",
      alias: "loop",
      description: "Ativa o modo repeticao",
      before: [isOnVoiceChannel, queueExistsOnGuild],
    })
  }

  async run(userInteraction: UserInteraction) {
    userInteraction.interaction.guild.player.toggleRepeat()
  }
}
