import { BaseCommand } from "../../types/global"
import isOnVoiceChannel from "../../utils/isOnVoiceChannel"

export default <BaseCommand>{
  name: "stop",
  description: "Para a musica e sai do canal de voz",
  async run(msg) {
    if (!isOnVoiceChannel(msg))
      return msg.reply(":warning: **|** Voce deve entrar em um canal de voz primeiro")

    msg.guild.player.stop()
  },
}
