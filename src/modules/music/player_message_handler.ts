import formatDuration from "../../utils/formatDuration"
import Track from "./track"
import { Message, EmbedBuilder } from "discord.js"
import { palette } from "../../config"
import { Command } from "../../types"
import { logger } from "../../utils/logger"
import { PlayerEvents } from "./player_event_emitter"
import { TrackNotfound } from "./track_searcher"

function reply(msg: Command, options: any) {
  if (msg instanceof Message) msg.reply(options)
  else msg.editReply(options)
}

export class PlayerMessageHandler implements PlayerEvents {
  public trackAdd(msg: Command, track: Track, shouldReply = true): void {
    if (!shouldReply) return

    const embed = new EmbedBuilder()
      .setColor(palette.embed.main)
      .setAuthor({ name: "Adicionada", iconURL: track.metadata?.requester.avatarURL() })
      .setDescription(`[${track.title}](${track.url})`)
      .setThumbnail(track.thumbnail)
      .addFields([
        {
          name: "Canal",
          value: track.author,
          inline: true,
        },
        {
          name: "Tempo",
          value: formatDuration(track.duration),
          inline: true,
        },
      ])

    reply(msg, { embeds: [embed] })
  }

  public playing(msg: Command, track: Track, shouldReply = true): void {
    if (!shouldReply) return

    const embed = new EmbedBuilder()
      .setColor(palette.embed.main)
      .setAuthor({ name: "Tocando agora", iconURL: track.metadata?.requester.avatarURL() })

      .setDescription(`[${track.title}](${track.url})`)
      .setThumbnail(track.thumbnail)
      .addFields([
        {
          name: "Canal",
          value: track.author,
          inline: true,
        },
        {
          name: "Tempo",
          value: formatDuration(track.duration),
          inline: true,
        },
      ])

    reply(msg, { embeds: [embed] })
  }

  public jump(msg: Command, track: Track, shouldReply = true): void {
    if (!shouldReply) return

    reply(msg, `⏭️ **|** Pulando para **${track.title}**`)
  }

  public pause(msg: Command, shouldReply = true): void {
    if (!shouldReply) return

    reply(msg, "⏸ **|** Musica pausada!")
  }

  public resume(msg: Command, shouldReply = true): void {
    if (!shouldReply) return

    reply(msg, ":arrow_forward: **|** Musica resumida!")
  }

  public volumeChange(msg: Command, oldVol: number, newVol: number, shouldReply = true): void {
    if (!shouldReply) return

    reply(msg, `:loud_sound: **|** Volume alterado para **${newVol}%**`)
  }

  public repeat(msg: Command, shouldReply = true): void {
    if (!shouldReply) return

    reply(
      msg,
      `:repeat: **|** Modo replay **${msg.guild.player.repeat ? "ativado" : "desativado"}**`
    )
  }

  public shuffle(msg: Command, shouldReply = true): void {
    if (!shouldReply) return

    reply(msg, `🔁 **|** Modo repeticao **${msg.guild.player.shuffle ? "ativado" : "desativado"}**`)
  }

  public playlistAdd(msg: Command, tracks: Track[], shouldReply = true): void {
    if (!shouldReply) return null

    const queueSpliced = [...tracks]
    queueSpliced.splice(10)

    let aproxDuration = 0
    tracks.forEach((song) => (aproxDuration = Number(song.duration) + aproxDuration))

    if (isNaN(aproxDuration)) aproxDuration = 0

    const embed = new EmbedBuilder()
      .setTitle("Playlist")
      .setColor(palette.embed.main)
      .setImage(tracks[0].thumbnail)
      .addFields([
        {
          name: `Lista (${tracks.length}) (aprox ${formatDuration(aproxDuration)} minutos)`,
          value: queueSpliced
            .map(
              (track, i) =>
                `**${i + 1}.** ${track.title ? track.title.trim() : "null"} - **${formatDuration(
                  track.duration
                )}**`
            )
            .join("\n"),
        },
      ])

    reply(msg, { embeds: [embed] })
  }

  public clearQueue(msg: Command, shouldReply = true): void {
    if (!shouldReply) return

    msg.channel.send("⏹️ **|** Playlist excluida")
  }

  public error(msg: Command, err: any): void {
    if (err instanceof TrackNotfound) {
      if (msg instanceof Message) {
        msg.reply(":warning: **|** Musica nao encontrada")
        return
      } else {
        msg.editReply(":warning: **|** Musica nao encontrada")
        return
      }
    }

    msg.reply(`:interrobang: **|** Ocorreu um erro inesperado! \`\`\`${err?.message}\`\`\``)

    logger.error(err)
  }

  public finish(): void {}
}
