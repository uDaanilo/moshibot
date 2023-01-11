import { readdirSync } from "fs"
import { SlashCommandBuilder } from "@discordjs/builders"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import { CommandInteraction, Message } from "discord.js"
import { logger } from "../utils/logger"
import { BaseCommand, InteractionOptionType } from "../types/global"
import { Command } from "../types"
import { join } from "path"

class CommandsHandler {
  public modules = readdirSync(`${__dirname}`).filter(
    (m) => !m.includes(".ts") && !m.includes(".js")
  )

  public commands = new Map<string, BaseCommand[]>()

  constructor() {
    this.registerCommands()
    this.registerSlashCommands()
  }

  private registerCommands() {
    this.modules.forEach((module) => {
      const cmds = readdirSync(join(__dirname, module))
      const cmdsObjects: BaseCommand[] = []

      cmds.forEach((cmd) => {
        const cmdObj = require(join(__dirname, module, cmd))
        cmdsObjects.push(cmdObj.default)
      })

      this.commands.set(module, cmdsObjects)
    })
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

  public handle(command: Message | CommandInteraction) {
    this.commands.forEach((commands, module) => {
      commands.forEach(async (cmd) => {
        const commandName = this._commandName(command)

        if (module === "dev" && command.member.user.id !== process.env.OWNER_ID) return

        if (commandName === cmd.name || (cmd.alias && commandName === cmd.alias)) {
          ;(command as Command).canDeferReply = () => {
            if (command instanceof CommandInteraction) return true

            return false
          }

          if (cmd.before) {
            await cmd.before(command as Command, () => {
              cmd.run(command as Command)
            })

            return
          }

          cmd.run(command as Command)
        }
      })
    })
  }

  private _commandName(command) {
    return command instanceof CommandInteraction && command.isCommand()
      ? command.commandName.toLowerCase()
      : command instanceof Message
      ? command.cmd.toLowerCase()
      : ""
  }
}

export default CommandsHandler
