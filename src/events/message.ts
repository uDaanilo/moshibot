import { IMessage } from "../types";
import Guild from "../db/models/Guild";

class onMessage {
  private args
  private cmd
  private defaultPrefix
  private guildPrefix
  private guildDb
  private msg: IMessage

  constructor(msg: IMessage) {
    if(msg.author.bot) return
    if(msg.channel.type === "dm") return

    this.msg = msg

    this.init()
  }

  private async init() {
    this.guildDb = await Guild.findOne({ id: this.msg.guild.id })

    this.defaultPrefix = this.msg.content
      .toLowerCase()
      .startsWith(process.env.DEFAULT_PREFIX.toLowerCase())

    this.guildPrefix = this.msg.content
      .toLowerCase()
      .startsWith(this.guildDb.prefix.toLowerCase())
      
    if(this.defaultPrefix) {
      this.args = this.msg.content
        .trim()
        .split(/ +/g)

        this.args.shift()
    } else if(this.guildPrefix) {
      this.args = this.msg.content
        .substr(this.guildDb.prefix.length)
        .trim()
        .split(/ +/g)
    }else {
      this.args = []
    }

    this.cmd = this.args[0] ? this.args[0].toLowerCase() : null
    this.args.shift()
    this.args = this.args.join(' ')

    this.msg.cmd = this.cmd
    this.msg.args = this.args

    this.msg.client.cmdsHandler.runCommand(this.msg)
  }
}

export default onMessage