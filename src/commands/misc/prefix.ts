import { InteractionOptionType } from "../../types/global"
import { GuildMember, PermissionFlagsBits } from "discord.js"
import { logger } from "../../utils/logger"
import { BaseCommand } from "../baseCommand"
import Guild from "../../db/models/Guild"
import { UserInteraction } from "../userInteraction"

export type PrefixCommandOptions = {
  prefixo: string
}

export default class PrefixCommand extends BaseCommand<PrefixCommandOptions> {
  constructor() {
    super({
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
    })
  }

  public async run(userInteraction: UserInteraction<PrefixCommandOptions>): Promise<any> {
    const { interaction } = userInteraction
    const { prefixo: prefix } = userInteraction.options

    if (!prefix)
      return userInteraction.reply(`:gear: **|** Prefixo atual: ${userInteraction.guild.db.prefix}`)

    if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.ManageMessages)) {
      return userInteraction.reply(
        ":warning: **|** Você não tem permissão para alterar o prefixo desse servidor!"
      )
    }
    if (prefix.length > 2)
      return userInteraction.reply(":gear: **|** O prefixo deve conter no máximo 2 caracteres")

    try {
      await Guild.updateOne({ id: userInteraction.guild.id }, { prefix })
      const updatedGuild = await Guild.findOne({ id: userInteraction.guild.id })

      if (!updatedGuild) throw new Error("Guild not found on database")
      userInteraction.guild.db = updatedGuild

      interaction.client.guilds.cache.set(userInteraction.guild.id, userInteraction.guild)

      userInteraction.reply(`:gear: **|** Prefixo alterado para **${prefix}**`)
    } catch (err) {
      logger.error(err)
      userInteraction.reply(":bangbang: **|** Ocorreu um erro!")
    }
  }
}
