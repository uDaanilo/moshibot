import { Command } from "."

/* eslint-disable */
export enum InteractionOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
}

export interface Options {
  name: string
  description: string
  required?: boolean
  type: InteractionOptionType
}

export interface BaseCommand {
  name: string
  description: string
  args?: string
  slash?: boolean
  alias?: string
  options?: Options[]
  before?(msg: Command, next: () => any): Promise<Command>
  run(command: Command): void
}
