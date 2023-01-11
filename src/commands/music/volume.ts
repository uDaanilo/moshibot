import { CommandInteraction, Message } from "discord.js"
import { BaseCommand, InteractionOptionType } from "../../types/global"
import isOnVoiceChannel from "../../utils/isOnVoiceChannel"
import queueExists from "../../utils/queueExists"

export default <BaseCommand>{
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
  async run(msg) {
    if (!isOnVoiceChannel(msg))
      return msg.reply(":warning: **|** Voce deve entrar em um canal de voz primeiro")

    if (!queueExists(msg)) {
      return msg.reply(
        ":warning: **|** Nao ha nenhuma musica na playlist para poder alterar o volume"
      )
    }

    let volume = 0

    if (msg instanceof Message) volume = msg.args ? Number(msg.args) : 0
    else if (msg instanceof CommandInteraction && msg.isCommand())
      volume = Number(msg.options.get("volume"))

    if (!volume)
      return msg.reply(`:loud_sound: **|** Volume atual: **${msg.guild.player.volume}%**`)

    msg.guild.player.setVolume(msg, volume)
  },
}
