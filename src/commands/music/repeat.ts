import { ICommand } from "../../types";

export default <ICommand> {
  args: '',
  run(msg) {
    const { player } = msg.client
    const serverQueue = player.queue.get(msg.guild.id)
    
    if (!serverQueue) return msg.channel.send(':warning: **|** Nao ha nada tocando para que seja possivel ativar esse modo!')
    player.setRepeat(msg)

    msg.channel.send(`:repeat: **|** <@${msg.author.id}> ${serverQueue.repeat ? 'ativou' : 'desativou'} o modo repeticao`)
  }
}