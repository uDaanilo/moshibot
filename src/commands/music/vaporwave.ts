import Play from "../../modules/music/play";
import { ICommand } from "../../types";

export default <ICommand> {
  args: '',
  run(msg) {
    const { player } = msg.client
    const serverQueue = player.queue.get(msg.guild.id)

    if(!serverQueue) return msg.channel.send(':warning: **|** Nao ha musicas tocando para que seja possivel ativar o vaporwave!')
    if(!msg.member.voice.channel) return msg.channel.send(':warning: **|** Voce deve estar conectado ao um canal de voz para ativar o vaporwave')

    player.setFilter(msg, `aresample=48000,asetrate=48000*0.8`)
  }
}