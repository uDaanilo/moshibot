import { ICommand } from "../../types";
import Guild from '../../db/models/Guild'

export default <ICommand> {
  args: '[prefix]',
  alias: 'prefixo',
  async run(msg) {
    const arg = msg.args.split(' ')[0]
    const guildDb = await Guild.findOne({ id: msg.guild.id })

    if(!arg.length) return msg.channel.send(`:gear: **|** Prefixo: **${guildDb.prefix}**`)
    if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send(":warning: **|** Voce nao tem permissao para isso")
    if(arg.length > 2) return msg.channel.send(":gear: **|** O prefixo deve conter no maximo dois caracteres")
    
    try {
      await Guild.updateOne({ id: msg.guild.id }, { prefix: arg })

      msg.channel.send(`:gear: **|** Prefixo alterado para '**${arg}**'`)
    } catch (err) {
      console.log(err)

      msg.channel.send(':warning: **|** Ocorreu um erro ao alterar o prefixo')
    }
  }
}