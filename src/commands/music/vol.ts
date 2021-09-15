import { ICommand } from "../../types";

export default <ICommand> {
  args: '[1 - 100]',
  alias: 'volume',
  run(msg) {
    const serverQueue = msg.client.player.queue.get(msg.guild.id)
    const vol: number = parseInt(msg.args.split(' ')[0])

    if(!serverQueue) return msg.channel.send(':warning: **|** Nao ha musicas tocando para que seja possivel alterar o volume!')
    if (!vol) return msg.channel.send(`:speaker: **|** Volume atual: **${serverQueue.volume}%**`)
    if(!msg.member.voice.channel) return msg.channel.send(':warning: **|** Voce deve estar conectado ao um canal de voz para alterar o volume')
    if (isNaN(vol) || vol < 1 || vol > 100 && msg.author.id != process.env.OWNER_ID) return msg.channel.send(":warning: **|** Use apenas numeros entre 1 e 100")

    if (vol > serverQueue.volume) {
      serverQueue.textChannel.send(`:loud_sound: **|** Volume alterado para: **${vol}%**`);
    }else{
      serverQueue.textChannel.send(`:sound: **|** Volume alterado para: **${vol}%**`);
    }

    msg.client.player.setVolume(msg, vol)
  }
}