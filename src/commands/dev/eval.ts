import { Message } from "discord.js"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"

export default class EvalCommand extends BaseCommand {
  constructor() {
    super({
      name: "eval",
      description: "Eval",
      slash: false,
      args: "<code>",
    })
  }

  public async run({ interaction: msg }: UserInteraction<null, Message>): Promise<void> {
    if (!(msg instanceof Message)) return
    const code = msg.content.split("eval ")[1]

    msg.reply("👌 **|** Executando...")

    try {
      // eslint-disable-next-line
      eval(code)
    } catch (err) {
      msg.reply(":bangbang: **|** `" + err.message + "`")
    }
  }
}
