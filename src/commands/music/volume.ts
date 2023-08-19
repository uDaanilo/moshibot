import { InteractionOptionType } from "../../types/global"
import { isOnVoiceChannel } from "../../utils/isOnVoiceChannel"
import { queueExistsOnGuild } from "../../utils/queueExistsOnGuild"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"

export type VolumeCommandOptions = {
  volume?: number
}

export default class VolumeCommand extends BaseCommand {
  constructor() {
    super({
      name: "volume",
      alias: "vol",
      description: "Altera o volume",
      args: "[0 - 100]",
      options: [
        {
          name: "volume",
          description: "Volume",
          type: InteractionOptionType.INTEGER,
        },
      ],
      before: [isOnVoiceChannel, queueExistsOnGuild],
    })
  }

  async run(userInteraction: UserInteraction<VolumeCommandOptions>) {
    const { volume } = userInteraction.options

    if (!volume) {
      return userInteraction.reply(
        `:loud_sound: **|** Volume atual: **${userInteraction.interaction.guild.player.volume}%**`
      )
    }

    userInteraction.interaction.guild.player.setVolume(+volume)
  }
}
