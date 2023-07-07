import { EmbedBuilder } from "discord.js"
import { palette } from "../../config"
import { BaseCommand } from "../../types/global"
import formatDuration from "../../utils/formatDuration"
import queueExists from "../../utils/queueExists"

export default <BaseCommand>{
  name: "queue",
  description: "Lista todas as musicas da playlist",
  before(msg, next) {
    if (!queueExists(msg))
      return msg.reply(":warning: **|** Nao ha nenhuma musica na playlist para poder usar isso")

    return next()
  },
  async run(msg) {
    const { player } = msg.guild
    const npTrack = player.queue.playingNow
    const queueSpliced = [...player.queue.tracks]
    queueSpliced.splice(10)

    const embed = new EmbedBuilder()
      .setImage(npTrack.thumbnail)
      .setColor(palette.embed.main)
      .setTitle(`${player.playing ? ":arrow_forward: " : ":pause_button: "} ${npTrack.title}`)
      .setURL(npTrack.url)
      .setDescription(`:sound: **${player.volume} / 100**`)
      .addFields([
        {
          name: `Lista (${player.queue.tracks.length}) (aprox ${formatDuration(
            player.queue.totalDuration
          )} minutos)`,
          value: queueSpliced
            .map(
              (track, i) =>
                `${i === 0 ? "**>** " : ""} **${i + 1}.** ${
                  track.title ? track.title.trim() : "null"
                } - **${formatDuration(track.duration)}**`
            )
            .join("\n"),
        },
      ])
      .setTimestamp()
      .setFooter({
        text: `${npTrack.metadata?.requester.username}`,
        iconURL: npTrack.metadata?.requester.avatarURL(),
      })

    msg.reply({ embeds: [embed] })
  },
}
