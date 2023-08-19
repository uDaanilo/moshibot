import {
  ButtonInteraction,
  CommandInteraction,
  InteractionReplyOptions,
  Message,
  MessageComponentInteraction,
  MessagePayload,
  SelectMenuInteraction,
} from "discord.js"

type InteractionTypeDefault =
  | SelectMenuInteraction
  | ButtonInteraction
  | CommandInteraction
  | Message

export class UserInteraction<
  OptionsType extends { [k: string]: string | number } = Record<string, string>,
  InteractionType extends InteractionTypeDefault = InteractionTypeDefault
> {
  constructor(
    public readonly commandName: string,
    public options: OptionsType = {} as OptionsType,
    public readonly interaction: InteractionType extends null
      ? InteractionTypeDefault
      : InteractionType
  ) {}

  public async reply(
    options: string | InteractionReplyOptions | MessagePayload
  ): Promise<
    | Awaited<ReturnType<Message["reply"]>>
    | Awaited<ReturnType<MessageComponentInteraction["reply"]>>
  > {
    if (this.interaction instanceof Message)
      return await this.interaction.reply(options as string | MessagePayload)
    else return await this.interaction.reply(options)
  }

  public async deferReply(): Promise<void> {
    if (this.interaction instanceof Message) return
    if (this.interaction.isButton()) return

    await this.interaction.deferReply()
  }
}
