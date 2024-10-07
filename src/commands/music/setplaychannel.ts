import { TextChannel } from "discord.js"
import Guild from "../../db/models/Guild"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"

export default class SetPlayChannelCommand extends BaseCommand {
  constructor() {
    super({
      name: "setplaychannel",
      description: "Seta um canal como canal de play",
    })
  }

  async run(userInteraction: UserInteraction) {
    if (!userInteraction.interaction.guild) throw new Error("Guild not found")
    if (!userInteraction.interaction.channel) throw new Error("Channel not found")

    try {
      await Guild.updateOne(
        { id: userInteraction.interaction.guild.id },
        {
          $set: {
            playChannelId: userInteraction.interaction.channel.id,
          },
        }
      )

      userInteraction.interaction.guild.db.playChannelId = userInteraction.interaction.channel.id

      userInteraction.reply(
        `Canal de play setado para \`${(userInteraction.interaction.channel as TextChannel).name}\``
      )
    } catch (err) {
      userInteraction.reply("Ocorreu um erro ao setar canal de play")
    }
  }
}
