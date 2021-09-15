import { MessageEmbed } from "discord.js";
import { ICommand } from "../../types";
import formatDuration from "../../utils/formatDuration";

export default <ICommand> {
  args: '',
  run(msg) {
    const { player } = msg.client
    const serverQueue = player.queue.get(msg.guild.id)

    const song = serverQueue.songs[0]
    const songsSpliced = [...serverQueue.songs]

    songsSpliced.splice(15)

    let aproxDuration = 0
    serverQueue.songs.forEach(song => aproxDuration = song.lengthSeconds + aproxDuration)
    isNaN(aproxDuration) ? aproxDuration = 0 : null
      
    const embed = new MessageEmbed()
      .setImage(song.thumbnail)
      .setColor("#7289DA")
      .setTitle(`${serverQueue.playing ? ':arrow_forward: ' : ':pause_button: '} ${song.title}`)
      .setURL(song.url)
      .setDescription(`:sound: **${serverQueue.volume} / 100**`)
      .addField(`Lista (${serverQueue.songs.length}) (aprox ${formatDuration(aproxDuration)} minutos)`, songsSpliced.map((song, i) => `${i == 0 ? '**>** ' : ''} **${i + 1}.** ${song.title ? song.title.trim() : 'null'} - **${song.duration}**`))
      .setTimestamp()
      .setFooter(`${song.requester.username}`, song.requester.avatarURL())

    msg.channel.send(embed)
  }

}