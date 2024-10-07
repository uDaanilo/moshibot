import { isOnVoiceChannel } from "../../utils/isOnVoiceChannel"
import { queueExistsOnGuild } from "../../utils/queueExistsOnGuild"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"

export default class PauseCommand extends BaseCommand {
  constructor() {
    super({
      name: "pause",
      description: "Pausa a musica tocando",
      before: [isOnVoiceChannel, queueExistsOnGuild],
    })
  }

  public async run(userInteraction: UserInteraction) {
    userInteraction.interaction.guild?.player.pause()
  }
}
