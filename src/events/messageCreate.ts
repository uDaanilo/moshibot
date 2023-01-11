import { Message } from "discord.js"
import { Command } from "../types"

const defaultPrefix = process.env.DEFAULT_PREFIX

function messageCreate(msg: Message) {
  const isDefaultPrefix = msg.content.toLowerCase().startsWith(defaultPrefix)
  const isGuildPrefix = msg.content.toLowerCase().startsWith(msg.guild.db.prefix)

  let args: string[]

  if (isGuildPrefix || isDefaultPrefix) {
    args = msg.content
      .trim()
      .substr(isDefaultPrefix ? defaultPrefix.length : msg.guild.db.prefix.length)
      .split(/ /g)
  } else {
    args = []
  }

  const cmd = args.shift()

  msg.args = args.join(" ")
  msg.cmd = cmd
  msg.canDeferReply = () => false

  if (
    !msg.cmd &&
    !msg.args &&
    !msg.attachments.size &&
    msg.channel.id === msg.guild.db.playChannelId &&
    process.env.NODE_ENV === "production"
  ) {
    msg.args = msg.content
    msg.guild.player.play(msg as Command)
  }

  if (!cmd) return

  msg.client.commandsHandler.handle(msg)
}

export default messageCreate
