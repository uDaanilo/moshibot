import { MessageEmbed } from 'discord.js'
import { ISong } from '../../types'

function play(song: ISong): MessageEmbed {
  const embed = new MessageEmbed()
    .setColor(process.env.DEFAULT_COLOR)
    .setAuthor('Tocando agora', song.requester.avatarURL())
    .setDescription(`[${song.title}](${song.url})`)
    .setThumbnail(song.thumbnail)
    .addField(`Canal`, song.channel, true)
    .addField(`Tempo`, song.duration, true)

  return embed
}

function add(song: ISong): MessageEmbed {
  const embed = new MessageEmbed()
    .setColor(process.env.DEFAULT_COLOR)
    .setAuthor('Adicionado', song.requester.avatarURL())
    .setDescription(`[${song.title}](${song.url})`)
    .setThumbnail(song.thumbnail)
    .addField(`Canal`, song.channel, true)
    .addField(`Tempo`, song.duration, true)

  return embed
}

export default { add, play }