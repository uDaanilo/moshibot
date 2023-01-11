import { TextChannel } from "discord.js"
import Guild from "../../db/models/Guild"
import { BaseCommand } from "../../types/global"

export default <BaseCommand>{
  name: "setplaychannel",
  description: "Seta um canal como canal de play",
  async run(msg) {
    try {
      await Guild.updateOne(
        { id: msg.guild.id },
        {
          $set: {
            playChannelId: msg.channel.id,
          },
        }
      )

      msg.guild.db.playChannelId = msg.channel.id

      msg.reply(`Canal de play setado para \`${(msg.channel as TextChannel).name}\``)
    } catch (err) {
      msg.reply("Ocorreu um erro ao setar canal de play")
    }
  },
}
