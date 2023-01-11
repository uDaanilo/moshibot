import { EmbedField, EmbedBuilder } from "discord.js"
import { BaseCommand } from "../../types/global"

export default <BaseCommand>{
  name: "help",
  alias: "commands",
  description: "Mostra uma lista com todos os comandos e seus atributos",
  async run(msg) {
    const { commands } = msg.client.commandsHandler

    const embed = new EmbedBuilder()
      .setTitle("Comandos")
      .setThumbnail(msg.client.user.avatarURL())
      .setColor("#7289DA")
      .setFooter({
        text: `Prefixo: ${msg.guild.db.prefix}`,
      }).setDescription(`
        <> Argumentos requiridos
        [] Argumentos opcionais
      `)
    const embedFields: EmbedField[] = []

    commands.forEach((cmds, module) => {
      if (module === "dev") return
      let description = ""

      cmds.forEach((cmd) => {
        description += "`" + cmd.name + "`" + ` ${cmd.args || ""}\n`
      })

      module = module.charAt(0).toUpperCase() + module.slice(1)
      embedFields.push({
        name: module,
        value: description,
        inline: false,
      })
    })

    embed.addFields(embedFields)
    msg.reply({ embeds: [embed] })
  },
}
