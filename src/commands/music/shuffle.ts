import { isOnVoiceChannel } from "../../utils/isOnVoiceChannel"
import { queueExistsOnGuild } from "../../utils/queueExistsOnGuild"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"

export default class ShuffleCommand extends BaseCommand {
  constructor() {
    super({
      name: "shuffle",
      description: "Ativa o modo aleatorio",
      before: [isOnVoiceChannel, queueExistsOnGuild],
    })
  }

  async run(userInteraction: UserInteraction) {
    userInteraction.interaction.guild.player.toggleShuffle()
  }
}
