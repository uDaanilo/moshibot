import { EmbedField, EmbedBuilder } from "discord.js"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"

export default class HelpCommand extends BaseCommand {
  constructor() {
    super({
      name: "help",
      alias: "commands",
      description: "Exibe uma lista com todos os comandos e seus atributos",
    })
  }

  public async run(userInteraction: UserInteraction): Promise<void> {
    const { interaction } = userInteraction
    const { commands } = interaction.client.commandsHandler

    const embed = new EmbedBuilder()
      .setTitle("Comandos")
      .setThumbnail(interaction.client.user.avatarURL())
      .setColor("#7289DA")
      .setFooter({
        text: `Prefixo: ${userInteraction.guild.db.prefix}`,
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
    userInteraction.reply({ embeds: [embed] })
  }
}
