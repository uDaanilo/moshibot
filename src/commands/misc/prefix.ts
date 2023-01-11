import { BaseCommand, InteractionOptionType } from "../../types/global"

import { CommandInteraction, GuildMember, Message, PermissionFlagsBits } from "discord.js"
import Guild from "../../db/models/Guild"
import { logger } from "../../utils/logger"

export default <BaseCommand>{
  name: "prefix",
  args: "[prefixo]",
  description: "Muda o prefixo do bot nesse servidor",
  options: [
    {
      name: "prefixo",
      description: "Novo prefixo",
      type: InteractionOptionType.STRING,
    },
  ],
  async run(msg) {
    let prefix

    if (msg instanceof CommandInteraction) prefix = msg.options.get("prefixo")
    else prefix = (msg as Message).args

    if (!prefix) return msg.reply(`:gear: **|** Prefixo atual: ${msg.guild.db.prefix}`)

    if (!(msg.member as GuildMember).permissions.has(PermissionFlagsBits.ManageMessages)) {
      return msg.reply(
        ":warning: **|** Você não tem permissão para alterar o prefixo desse servidor!"
      )
    }

    if (prefix.length > 2)
      return msg.reply(":gear: **|** O prefixo deve conter no máximo 2 caracteres")

    try {
      await Guild.updateOne({ id: msg.guild.id }, { prefix })
      const updatedGuild = await Guild.findOne({ id: msg.guild.id })

      msg.guild.db = updatedGuild

      msg.client.guilds.cache.set(msg.guild.id, msg.guild)

      msg.reply(`:gear: **|** Prefixo alterado para **${prefix}**`)
    } catch (err) {
      logger.error(err)
      msg.reply(":bangbang: **|** Ocorreu um erro!")
    }
  },
}
