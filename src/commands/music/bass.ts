import { ICommand } from "../../types";

export default <ICommand> {
  args: '<number>',
  alias: 'bassboost',
  run(msg) {
    const { player } = msg.client
    const serverQueue = player.queue.get(msg.guild.id)
    const bass: number = parseInt(msg.args.split(' ')[0])

    if(!serverQueue) return msg.channel.send(':warning: **|** Nao ha musicas tocando para que seja possivel alterar o bass!')
    if(!msg.member.voice.channel) return msg.channel.send(':warning: **|** Voce deve estar conectado ao um canal de voz para alterar o bass')
    if(!bass || bass < 0 || bass > 100) return msg.channel.send(':warning: **|** O valor deve ser maior que 0')

    player.setFilter(msg, `bass=g=${bass}`)
  }
}