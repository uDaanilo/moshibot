import { Message, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from "discord.js"
import { palette } from "../../config"
import Guild from "../../db/models/Guild"
import { logger } from "../../utils/logger"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"

export default class SetPlayerChannelCommand extends BaseCommand {
  constructor() {
    super({
      name: "setplayerchannel",
      description: "Seta um player de musica que atualiza em tempo real",
    })
  }

  async run(userInteraction: UserInteraction) {
    const embed = new EmbedBuilder()
      .setImage(userInteraction.interaction.client.user.avatarURL({ size: 1024 }))
      .setColor(palette.embed.main)

    const stopButton = new ButtonBuilder()
      .setCustomId("stop")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("897107010666000394")

    const shuffleButton = new ButtonBuilder()
      .setCustomId("shuffle")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("1292630553006444595")

    const repeatButton = new ButtonBuilder()
      .setCustomId("repeat")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("863732580665524224")

    const playpauseButton = new ButtonBuilder()
      .setCustomId("playpause")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("859265510516588575")

    const nextButton = new ButtonBuilder()
      .setCustomId("next")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("859265681451515906")

    const row = new ActionRowBuilder().addComponents([
      stopButton,
      shuffleButton,
      playpauseButton,
      repeatButton,
      nextButton,
    ])

    // @ts-ignore
    await userInteraction.reply({ embeds: [embed], components: [row] }).then(async (msg) => {
      const channelId = msg instanceof Message ? msg.channelId : msg.interaction.channelId
      const messageId = msg instanceof Message ? msg.id : (await msg.fetch()).id

      try {
        await Guild.updateOne(
          { id: userInteraction.guild.id },
          { playerChannel: { ch: channelId, msg: messageId } }
        )
        const guildDb = await Guild.findOne({ id: userInteraction.guild.id })

        if (!guildDb) throw new Error("Guild not found on database")

        userInteraction.guild.db = guildDb

        userInteraction.interaction.client.guilds.cache.set(
          userInteraction.guild.id,
          userInteraction.guild
        )

        userInteraction.guild.player.reloadInteractiveMessage()
      } catch (err) {
        logger.error(err)
      }
    })
  }
}
