import formatDuration from "../../utils/formatDuration"
import Track from "./track"
import { Message, EmbedBuilder, TextChannel } from "discord.js"
import { palette } from "../../config"
import { Command } from "../../types"
import { logger } from "../../utils/logger"
import { PlayerEvents } from "./player_event_emitter"

export class PlayerMessageHandler implements PlayerEvents {
  constructor(private _textChannel?: TextChannel) {}

  public setTextChannel(textChannel: TextChannel) {
    this._textChannel = textChannel
  }

  private reply(msg: Command, options?: any) {
    if (!msg && this._textChannel) {
      this._textChannel.send(options)
      return
    } else if (!msg && !this._textChannel) {
      return
    }

    if (msg instanceof Message) msg.reply(options)
    else msg.editReply(options)
  }

  private _getCommandFromTrack(track: Track) {
    return track.metadata.command
  }

  public trackAdd(track: Track): void {
    const cmd = this._getCommandFromTrack(track)

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

    this.reply(cmd, { embeds: [embed] })
  }

  public playing(track: Track): void {
    const cmd = this._getCommandFromTrack(track)

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

    this.reply(cmd, { embeds: [embed] })
  }

  public jump(track: Track): void {
    const cmd = this._getCommandFromTrack(track)

    this.reply(cmd, `⏭️ **|** Pulando para **${track.title}**`)
  }

  public pause(track: Track): void {
    const cmd = this._getCommandFromTrack(track)

    this.reply(cmd, "⏸ **|** Musica pausada!")
  }

  public resume(track: Track): void {
    const cmd = this._getCommandFromTrack(track)

    this.reply(cmd, ":arrow_forward: **|** Musica resumida!")
  }

  public volumeChange(track: Track, oldVol: number, newVol: number): void {
    const cmd = this._getCommandFromTrack(track)

    const emoji = newVol > oldVol ? ":loud_sound:" : ":sound:"
    this.reply(cmd, `${emoji} **|** Volume alterado para **${newVol}%**`)
  }

  public repeat(track: Track): void {
    const cmd = this._getCommandFromTrack(track)

    this.reply(
      cmd,
      `:repeat: **|** Modo replay **${cmd.guild.player.repeat ? "ativado" : "desativado"}**`
    )
  }

  public shuffle(track: Track): void {
    const cmd = this._getCommandFromTrack(track)

    this.reply(
      cmd,
      `🔁 **|** Modo repeticao **${cmd.guild.player.shuffle ? "ativado" : "desativado"}**`
    )
  }

  public playlistAdd(tracks: Track[]): void {
    const cmd = this._getCommandFromTrack(tracks[0])
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

    this.reply(cmd, { embeds: [embed] })
  }

  public clearQueue(): void {
    this._textChannel.send("⏹️ **|** Playlist excluida")
  }

  public error(err: any): void {
    logger.error(err)
  }

  public finish(): void {}
}
