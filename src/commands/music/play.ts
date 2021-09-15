import { ICommand } from "../../types";

export default <ICommand> {
  args: '<nome ou url>',
  alias: 'p',
  run(msg) {
    const { player } = msg.client

    player.play(msg)
  }
}