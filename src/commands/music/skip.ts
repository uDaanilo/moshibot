import { ICommand } from "../../types";

export default <ICommand> {
  args: '[number]',
  alias: 'next',
  run(msg) {
    const serverQueue = msg.client.player.queue.get(msg.guild.id)
    let index: number = parseInt(msg.args.split(' ')[0]) - 1
    const { player } = msg.client

    if(isNaN(index)) index = null

    if(!serverQueue || !serverQueue.songs.length) return msg.channel.send(':warning: **|** Nao ha musicas na playlist para que seja possivel pular!')

    if(index) {
      if(index < 1 || index >= serverQueue.songs.length) return msg.channel.send(':warning: **|** Argumento invalido')

      msg.channel.send(`:fast_forward: **|** Pulando para **${serverQueue.songs[index].title}**`)
    } else {
      msg.channel.send(`:fast_forward: **|** Musica pulada`)
    }

    player.skip(msg, index)

  }
}