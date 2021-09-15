import { ICommand } from "../../types";

export default <ICommand> {
  args: '<1 - 50>',
  alias: 'delete',
  async run(msg) {
    const arg = parseInt(msg.args.split(' ')[0])

    if(msg.channel.type == "dm") return

    await msg.delete()
    if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.reply("Voce nao tem permissao para executar este comando!")
    if (isNaN(arg)) return msg.channel.send("Argumento invalido, use apenas numeros!")
    if (arg > 50 || arg < 0) return msg.channel.send("O maximo de mensagens a ser deletada e 50 por vez!")

    if(arg == 0 && msg.author.id == process.env.OWNER_ID){
      const pickMsg = await msg.channel.messages.fetch()

      msg.channel.bulkDelete(pickMsg)
        .then(() => {
          if(msg.channel.type == "dm") return
          
          msg.channel.send(`:warning: **|** Deletada **TODAS** mensagens envidas dentro de duas semanas no canal **${msg.channel.name}**`)
            .then(m => m.delete({ timeout: 5000 }))
            .catch(console.log)
        })

    }else{
      if(arg <= 0) return msg.channel.send('O numero de mensagens a ser deletada deve ser maior que 0')
      const pickMsg = await msg.channel.messages.fetch({ limit: arg })

      msg.channel.bulkDelete(pickMsg)
        .then(() => {
          if(msg.channel.type == "dm") return

          msg.channel.send(`:warning: **|** Deletado **${pickMsg.size}** mensagens no canal **${msg.channel.name}**`)
            .then(m => m.delete({ timeout: 5000 }))
            .catch(console.log)
        })
    }
  }
}