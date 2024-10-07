import { isOnVoiceChannel } from "../../utils/isOnVoiceChannel"
import { queueExistsOnGuild } from "../../utils/queueExistsOnGuild"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"

export default class ResumeCommand extends BaseCommand {
  constructor() {
    super({
      name: "resume",
      description: "Resume a musica tocando",
      before: [isOnVoiceChannel, queueExistsOnGuild],
    })
  }

  async run(userInteraction: UserInteraction) {
    userInteraction.interaction.guild?.player.resume()
  }
}
