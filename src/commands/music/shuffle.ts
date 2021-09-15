import { ICommand } from "../../types";

export default <ICommand> {
  args: '',
  run(msg) {
    const { player } = msg.client
    const serverQueue = player.queue.get(msg.guild.id)
    
    if (!serverQueue) return msg.channel.send(':warning: **|** Nao ha nada tocando para que seja possivel ativar esse modo!')
    player.setShuffle(msg)

    msg.channel.send(`:twisted_rightwards_arrows: **|** <@${msg.author.id}> ${serverQueue.shuffle ? 'ativou' : 'desativou'} o modo aleatorio`)
  }
}