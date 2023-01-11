import { ButtonInteraction, CommandInteraction, Message, SelectMenuInteraction } from "discord.js"

export type Command = (SelectMenuInteraction | ButtonInteraction | CommandInteraction | Message) & {
  args: string
  reply: (
    ...args: SelectMenuInteraction["reply"] | CommandInteraction["reply"] | Message["reply"]
  ) => Promise<any>
  canDeferReply(): this is SelectMenuInteraction | CommandInteraction
}
