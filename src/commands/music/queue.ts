import { EmbedBuilder, Guild } from "discord.js"
import { palette } from "../../config"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"
import { queueExistsOnGuild } from "../../utils/queueExistsOnGuild"
import formatDuration from "../../utils/formatDuration"

export default class QueueCommand extends BaseCommand {
  constructor() {
    super({
      name: "queue",
      description: "Lista todas as musicas da playlist",
      before: [queueExistsOnGuild],
    })
  }

  public async run(userInteraction: UserInteraction) {
    const { player } = userInteraction.interaction.guild as Guild
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
        text: `${npTrack.metadata?.requester?.username}`,
        iconURL: npTrack.metadata?.requester?.avatarURL() ?? "",
      })

    userInteraction.reply({ embeds: [embed] })
  }
}
