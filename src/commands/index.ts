import { readdirSync } from "fs"
import { SlashCommandBuilder } from "@discordjs/builders"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import { logger } from "../utils/logger"
import { InteractionOptionType } from "../types/global"
import { join } from "path"
import { UserInteraction } from "./userInteraction"
import { BaseCommand } from "./baseCommand"

class CommandsHandler {
  public modules = readdirSync(`${__dirname}`).filter(
    (m) => !m.includes(".ts") && !m.includes(".js")
  )

  public commands = new Map<string, BaseCommand[]>()

  constructor() {
    this.registerCommands()
    this.registerSlashCommands()
  }

  private async registerCommands() {
    for (const module of this.modules) {
      const cmdFiles = readdirSync(join(__dirname, module))
      const cmds: BaseCommand[] = []

      for (const cmdFilename of cmdFiles) {
        const CommandConstructor = (await import(join(__dirname, module, cmdFilename))).default
        cmds.push(new CommandConstructor())
      }

      this.commands.set(module, cmds)
    }
  }

  private registerSlashCommands() {
    const cmdsFormattedToRegister = []

    this.commands.forEach((module) => {
      module.forEach((cmd) => {
        if (cmd.slash !== null && cmd.slash === false) return

        const cmdBuilder = new SlashCommandBuilder()
          .setName(cmd.name)
          .setDescription(cmd.description)

        if (cmd.options) {
          cmd.options.forEach((option) => {
            switch (option.type) {
              case InteractionOptionType.SUB_COMMAND:
                cmdBuilder.addSubcommand((opt) =>
                  opt.setName(option.name).setDescription(option.description)
                )
                break
              case InteractionOptionType.SUB_COMMAND_GROUP:
                cmdBuilder.addSubcommandGroup((opt) =>
                  opt.setName(option.name).setDescription(option.description)
                )
                break
              case InteractionOptionType.STRING:
                cmdBuilder.addStringOption((opt) =>
                  opt
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required ? option.required : false)
                )
                break
              case InteractionOptionType.INTEGER:
              case InteractionOptionType.NUMBER:
                cmdBuilder.addIntegerOption((opt) =>
                  opt
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required ? option.required : false)
                )
                break
              case InteractionOptionType.BOOLEAN:
                cmdBuilder.addBooleanOption((opt) =>
                  opt
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required ? option.required : false)
                )
                break
              case InteractionOptionType.USER:
                cmdBuilder.addUserOption((opt) =>
                  opt
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required ? option.required : false)
                )
                break
              case InteractionOptionType.CHANNEL:
                cmdBuilder.addChannelOption((opt) =>
                  opt
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required ? option.required : false)
                )
                break
              case InteractionOptionType.ROLE:
                cmdBuilder.addRoleOption((opt) =>
                  opt
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required ? option.required : false)
                )
                break
              case InteractionOptionType.MENTIONABLE:
                cmdBuilder.addMentionableOption((opt) =>
                  opt
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required ? option.required : false)
                )
                break
            }
          })
        }

        cmdsFormattedToRegister.push(cmdBuilder.toJSON())
      })
    })

    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN)
    try {
      if (process.env.NODE_ENV === "development") {
        rest
          .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD), {
            body: cmdsFormattedToRegister,
          })
          .then(() =>
            logger.info(`[BOT] Registered ${cmdsFormattedToRegister.length} commands on test guild`)
          )
      } else {
        rest
          .put(Routes.applicationCommands(process.env.CLIENT_ID), { body: cmdsFormattedToRegister })
          .then(() =>
            logger.info(
              `[BOT] Registered ${cmdsFormattedToRegister.length} commands as global command`
            )
          )
      }
    } catch (error) {
      logger.error(error)
    }
  }

  public async handle(userInteraction: UserInteraction) {
    const { module, command } = this.getCommandByName(userInteraction.commandName)

    if (!command) return
    if (module === "dev" && userInteraction.interaction.member.user.id !== process.env.OWNER_ID)
      return

    try {
      if (Array.isArray(command.before) && command.before.length > 0) {
        const cancelExecution = await this.runBeforeMiddlewares(command, userInteraction)
        if (cancelExecution) return
      }

      userInteraction.options = command.extractOptionsFromUserInteraction(userInteraction)
      await command.run(userInteraction)
    } catch (err) {
      logger.error(err)
      userInteraction.reply(":bangbang: **|** Ocorreu um erro ao executar o comando :/")
    }
  }

  public getCommandByName(name: string): { module: string; command: BaseCommand } | null {
    let command: BaseCommand | undefined
    let commandModule: string | undefined

    this.commands.forEach((commands, module) => {
      commands.forEach((cmd) => {
        if (name === cmd.name || (cmd.alias && name === cmd.alias)) {
          command = cmd
          commandModule = module
        }
      })
    })

    return {
      module: commandModule,
      command,
    }
  }

  private async runBeforeMiddlewares(command: BaseCommand, userInteraction: UserInteraction) {
    let cancelExecution = false

    for (const before of command.before) {
      const shouldRunNext = await before(userInteraction)

      if (!shouldRunNext) {
        cancelExecution = true
        break
      }
    }

    return cancelExecution
  }
}

export default CommandsHandler
