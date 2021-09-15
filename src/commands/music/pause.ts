import { ICommand } from "../../types"

export default <ICommand> {
  args: '',
  run(msg) {
    const serverQueue = msg.client.player.queue.get(msg.guild.id)
    const { player } = msg.client
    
    if (!serverQueue) return msg.channel.send(':warning: **|** Nao ha nada tocando para que seja possivel pausar a musica!')

    if(serverQueue.playing) {
      player.pause(msg)
      msg.channel.send('⏸ **|** Musica pausada!')
    }
  }
}