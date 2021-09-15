import { MessageEmbed } from "discord.js";
import { ICommand, IMessage } from "../../types";

export default <ICommand> {
  args: '[@user]',
  run(msg: IMessage) {
    let embed = new MessageEmbed()
      .setColor(process.env.DEFAULT_COLOR)

    if(msg.mentions.members.size){
      const user = msg.mentions.members.first().user

      embed.setTitle(`:frame_photo: ${user.username}`)
      embed.setImage(user.avatarURL({ size: 512 }))
    } else {
      embed.setTitle(`:frame_photo: ${msg.author.username}`)
      embed.setImage(msg.author.avatarURL({ size: 512 }))
    }

    return msg.channel.send(embed)
  }
}