import {
  ButtonInteraction,
  CommandInteraction,
  Guild,
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
  public readonly guild: Guild

  constructor(
    public readonly commandName: string,
    public options: OptionsType = {} as OptionsType,
    public readonly interaction: InteractionType extends null
      ? InteractionTypeDefault
      : InteractionType
  ) {
    if (!(interaction.guild instanceof Guild)) throw new Error("Interaction.guild is mandatory")

    this.guild = interaction.guild
  }

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
