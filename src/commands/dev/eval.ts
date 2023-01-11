import { BaseCommand } from "../../types/global"

export default <BaseCommand>{
  name: "eval",
  slash: false,
  description: "Eval",
  async run(msg) {
    msg.reply("👌 **|** Executando...")

    try {
      // eslint-disable-next-line
      eval(msg.args)
    } catch (err) {
      msg.reply(":bangbang: **|** `" + err.message + "`")
    }
  },
}
