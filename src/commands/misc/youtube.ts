import axios from "axios";
import { MessageEmbed } from "discord.js";
import { ICommand, IMessage } from "../../types";

export default <ICommand> {
  args: '',
  alias: 'amogusss',
  run(msg: IMessage) {
    if(!msg.member.voice.channel) return msg.channel.send(':warning: **|** Voce deve entrar em um canal de voz primeiro')
    
    const apps = {
      youtube: '755600276941176913',
      amogus: '773336526917861400'
    }

    const app = msg.cmd == 'amogusss' ? apps.amogus : apps.youtube
    
    axios.post(`https://discord.com/api/v8/channels/${msg.member.voice.channel.id}/invites`, {
      max_age: 86400,
      max_uses: 0,
      target_application_id: app,
      target_type: 2,
      temporary: false,
      validate: null
    }, {
      headers: {
        Authorization: `Bot ${process.env.TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if(!res.data || !res.data.code) throw new Error('Invalid invite code')
      
      const embed = new MessageEmbed()
        .setColor(process.env.DEFAULT_COLOR)
        .setAuthor(msg.client.user.username, msg.client.user.avatarURL())
        .setDescription(`Clique [aqui](https://discord.com/invite/${res.data.code}) para comecar a assistir`)

      msg.channel.send(embed)
    })
    .catch(err => {
      console.log(err)
      msg.channel.send(':bangbang: **|** Ocorreu um erro')
    })
  }
}