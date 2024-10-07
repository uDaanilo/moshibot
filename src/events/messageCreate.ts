import { ChannelType, Message } from "discord.js"
import { EventHandler } from "./eventHandler"
import { UserInteraction } from "../commands/userInteraction"
import { PlayCommandOptions } from "../commands/music/play"

class MessageCreate implements EventHandler {
  private readonly DEFAULT_PREFIX: string = process.env.DEFAULT_PREFIX as string

  public handle(msg: Message<true>) {
    if (msg.author.bot) return
    if (msg.channel.type !== ChannelType.GuildText) return

    const { client } = msg
    let args: string[] = []
    if (this.messageHasPrefix(msg)) args = this.extractArgs(msg)

    const commandName = args.shift()
    if (!commandName) return

    const userInteraction = new UserInteraction(commandName, {}, msg)

    if (!commandName && this.isPlayChannelMessage(msg)) {
      userInteraction.options = {
        nome: msg.content,
      } as PlayCommandOptions
      msg.guild.player.playOnVoiceChannel(
        userInteraction as UserInteraction<PlayCommandOptions, Message>
      )
      return
    }

    client.commandsHandler.handle(userInteraction)
  }

  private messageHasPrefix(msg: Message<true>): boolean {
    const messageHasDefaultPrefix = msg.content.toLowerCase().startsWith(this.DEFAULT_PREFIX)
    const messageHasGuildPrefix = msg.content.toLowerCase().startsWith(msg.guild.db.prefix)

    return messageHasDefaultPrefix || messageHasGuildPrefix
  }

  private extractArgs(msg: Message<true>): string[] {
    const messageHasDefaultPrefix = msg.content.toLowerCase().startsWith(this.DEFAULT_PREFIX)

    const args = msg.content
      .trim()
      .substr(messageHasDefaultPrefix ? this.DEFAULT_PREFIX.length : msg.guild.db.prefix.length)
      .split(/ /g)

    return args
  }

  private isPlayChannelMessage(msg: Message<true>): boolean {
    return (
      !msg.attachments.size &&
      msg.channel.id === msg.guild.db.playChannelId &&
      process.env.NODE_ENV === "production"
    )
  }
}

export default MessageCreate
