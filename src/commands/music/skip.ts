import { CommandInteraction, Message } from "discord.js"
import { BaseCommand, InteractionOptionType } from "../../types/global"
import isOnVoiceChannel from "../../utils/isOnVoiceChannel"
import queueExists from "../../utils/queueExists"

export default <BaseCommand>{
  name: "skip",
  alias: "next",
  description: "Pula a musica atual",
  options: [
    {
      name: "numero",
      description: "Numero da musica para pular, caso nao seja informado ira pular para proxima",
      type: InteractionOptionType.INTEGER,
    },
  ],
  before(msg, next) {
    if (!isOnVoiceChannel(msg))
      return msg.reply(":warning: **|** Voce deve entrar em um canal de voz primeiro")

    if (!queueExists(msg))
      return msg.reply(":warning: **|** Nao ha nenhuma musica na playlist para poder pular")

    next()
  },
  async run(msg) {
    const { player } = msg.guild
    let index: number

    if (msg instanceof Message) index = Number(msg.args.split(" ")[0]) - 1
    // @ts-ignore
    else if (msg instanceof CommandInteraction) index = msg.options.get("numero") - 1

    if (index && index >= 1) {
      if (index >= player.queue.tracks.length)
        return msg.reply(":warning: **|** Argumento invalido")

      player.jump(index)

      return
    }

    player.jump()
  },
}
