import { ChannelType, Message } from "discord.js"
import { EventHandler } from "./eventHandler"
import { UserInteraction } from "../commands/userInteraction"
import { PlayCommandOptions } from "../commands/music/play"

class MessageCreate implements EventHandler {
  private readonly DEFAULT_PREFIX = process.env.DEFAULT_PREFIX

  public handle(msg: Message) {
    if (msg.author.bot) return
    if (msg.channel.type === ChannelType.DM) return

    const { client } = msg
    const messageHasDefaultPrefix = msg.content.toLowerCase().startsWith(this.DEFAULT_PREFIX)
    const messageHasGuildPrefix = msg.content.toLowerCase().startsWith(msg.guild.db.prefix)
    let args: string[] = []

    if (messageHasDefaultPrefix || messageHasGuildPrefix) {
      args = msg.content
        .trim()
        .substr(messageHasDefaultPrefix ? this.DEFAULT_PREFIX.length : msg.guild.db.prefix.length)
        .split(/ /g)
    }

    const commandName = args.shift()
    const userInteraction = new UserInteraction(commandName, {}, msg)

    if (
      !commandName &&
      !msg.attachments.size &&
      msg.channel.id === msg.guild.db.playChannelId &&
      process.env.NODE_ENV === "production"
    ) {
      userInteraction.options = {
        nome: args.join(" "),
      } as PlayCommandOptions
      msg.guild.player.playOnVoiceChannel(userInteraction as UserInteraction<PlayCommandOptions>)
      return
    }

    if (!commandName) return

    client.commandsHandler.handle(userInteraction)
  }
}

export default MessageCreate
