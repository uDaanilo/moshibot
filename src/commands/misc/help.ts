import { MessageEmbed } from "discord.js";
import { ICommand, IMessage } from "../../types";
import Guild from '../../db/models/Guild'

export default <ICommand> {
  args: '',
  alias: 'commands',
  async run(msg: IMessage) {
    const { commands } = msg.client.cmdsHandler
    const guildDb = await Guild.findOne({ id: msg.guild.id })

    const embed = new MessageEmbed()
      .setTitle('Comandos')
      .setThumbnail(msg.client.user.avatarURL())
      .setColor(process.env.DEFAULT_COLOR)
      .setFooter(`Prefixo: ${guildDb.prefix}`)
      .setDescription(`
        <> Argumentos requiridos
        [] Argumentos opcionais
      `)

    commands.forEach((cmds, module) => {
      if(module == 'dev') return
      let description = ''

      cmds.forEach(cmd => {
        description += '`' + cmd.command + '`' + ` ${cmd.args}\n`
      })

      module = module.charAt(0).toUpperCase() + module.slice(1)
      embed.addField(module, description)
    })


    msg.author.send(embed)
  }
}