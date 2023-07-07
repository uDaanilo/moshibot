import { BaseCommand } from "../../types/global"
import isOnVoiceChannel from "../../utils/isOnVoiceChannel"
import queueExists from "../../utils/queueExists"

export default <BaseCommand>{
  name: "repeat",
  alias: "loop",
  description: "Ativa o modo repeticao",
  async run(msg) {
    if (!isOnVoiceChannel(msg))
      return msg.reply(":warning: **|** Voce deve entrar em um canal de voz primeiro")

    if (!queueExists(msg))
      return msg.reply(":warning: **|** Nao ha nenhuma musica na playlist para poder usar isso")

    msg.guild.player.toggleRepeat()
  },
}
