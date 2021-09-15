import { ICommand } from "../../types";

export default <ICommand> {
  args: '',
  run(msg) {
    if(msg.author.id !== process.env.OWNER_ID) return

    msg.channel.send(':arrows_counterclockwise: **|** Executando...')
    eval(msg.args)

  }
}