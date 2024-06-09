import { Message } from "discord.js"
import { InteractionOptionType } from "../types/global"
import { UserInteraction } from "./userInteraction"

export type Option<T = string> = {
  name: T
  description: string
  type: InteractionOptionType
  required?: boolean
}

export type BeforeCommand = (interaction: UserInteraction) => Promise<boolean> | boolean
interface BaseCommandInput<T> {
  name: string
  description: string
  args?: string
  slash?: boolean
  alias?: string
  options?: Array<Option<keyof T>>
  before?: BeforeCommand[]
}

export abstract class BaseCommand<T extends Record<string, any> = Record<string, any>> {
  public readonly name: string
  public readonly description: string
  public readonly args?: string = ""
  public readonly slash?: boolean = true
  public readonly alias?: string = ""
  public readonly options?: Array<Option<keyof T>> = []
  public readonly before?: BeforeCommand[] = []

  constructor({ name, description, args, slash, alias, options, before }: BaseCommandInput<T>) {
    this.name = name
    this.description = description
    this.args = args
    this.slash = slash
    this.alias = alias
    this.options = options
    this.before = before
  }

  public extractOptionsFromUserInteraction(userInteraction: UserInteraction) {
    const { interaction } = userInteraction

    if (!this.options || !Array.isArray(this.options)) return {} as { [key in keyof T]: T[key] }

    const optionsValues = this.options.reduce((acc, option, i) => {
      let value

      if (interaction instanceof Message) {
        if (interaction.content.length) {
          const args = interaction.content.split(
            new RegExp(`${userInteraction.commandName}(.*)`, "s")
          )
          value = args[1].trim()
        }
      } else if (interaction.isSelectMenu()) {
        value = interaction.values[i]
      } else if (interaction.isCommand()) {
        value = interaction.options.get(option.name as string)?.value
      }

      return {
        ...acc,
        [option.name]: value,
      }
    }, {})

    return optionsValues as {
      [key in keyof T]: T[key]
    }
  }

  public abstract run(_userInteraction: UserInteraction): Promise<any>
}
