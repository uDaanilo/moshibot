import { ICommand } from "../../types"

export default <ICommand> {
  args: '',
  run(msg) {
    const serverQueue = msg.client.player.queue.get(msg.guild.id)
    const { player } = msg.client
    if (!serverQueue || !serverQueue.songs) return msg.channel.send(':warning: **|** Nao ha musicas tocando para que seja possivel parar!')

    player.stop(msg)
    msg.channel.send(`:warning: **|** Playlist excluida a pedido de <@${msg.author.id}>`)
  }
}