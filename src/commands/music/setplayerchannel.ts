import { Message, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from "discord.js"
import { palette } from "../../config"
import Guild from "../../db/models/Guild"
import { BaseCommand } from "../../types/global"
import { logger } from "../../utils/logger"

export default <BaseCommand>{
  name: "setplayerchannel",
  description: "Seta um player de musica que atualiza em tempo real",
  async run(msg) {
    const embed = new EmbedBuilder()
      .setImage(msg.client.user.avatarURL({ size: 1024 }))
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
    msg.reply({ embeds: [embed], components: [row], fetchReply: true }).then(async (msg) => {
      msg = msg as Message

      try {
        await Guild.updateOne(
          { id: msg.guild.id },
          { playerChannel: { ch: msg.channel.id, msg: msg.id } }
        )
        const guildDb = await Guild.findOne({ id: msg.guild.id })

        msg.guild.db = guildDb

        msg.client.guilds.cache.set(msg.guild.id, msg.guild)
      } catch (err) {
        logger.error(err)
      }
    })
  },
}
