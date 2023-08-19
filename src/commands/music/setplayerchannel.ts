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
      .setEmoji("<:stop:897107010666000394>")

    const shuffleButton = new ButtonBuilder()
      .setCustomId("shuffle")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("<:shuffle:863732595782844426>")

    const repeatButton = new ButtonBuilder()
      .setCustomId("repeat")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("<:repeat:863732580665524224>")

    const playpauseButton = new ButtonBuilder()
      .setCustomId("playpause")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("<:play_pause:859265510516588575>")

    const nextButton = new ButtonBuilder()
      .setCustomId("next")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("<:skip_next:859265681451515906>")

    const row = new ActionRowBuilder().addComponents([
      stopButton,
      shuffleButton,
      playpauseButton,
      repeatButton,
      nextButton,
    ])

    // @ts-ignore
    userInteraction.reply({ embeds: [embed], components: [row] }).then(async (msg) => {
      const channelId = msg instanceof Message ? msg.channelId : msg.interaction.channelId
      const messageId = msg instanceof Message ? msg.id : (await msg.fetch()).id

      try {
        await Guild.updateOne(
          { id: userInteraction.interaction.guild.id },
          { playerChannel: { ch: channelId, msg: messageId } }
        )
        const guildDb = await Guild.findOne({ id: userInteraction.interaction.guild.id })

        userInteraction.interaction.guild.db = guildDb

        userInteraction.interaction.client.guilds.cache.set(
          userInteraction.interaction.guild.id,
          userInteraction.interaction.guild
        )

        userInteraction.interaction.guild.player.reloadInteractiveMessage()
      } catch (err) {
        logger.error(err)
      }
    })
  }
}
