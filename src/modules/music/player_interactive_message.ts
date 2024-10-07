import { Message, EmbedBuilder } from "discord.js"
import { palette } from "../../config"
import formatDuration from "../../utils/formatDuration"
import GuildPlayer from "./guild_player"

export class PlayerInteractiveMessage {
  constructor(private _message: Message, private _guildPlayer: GuildPlayer) {
    this.enable()
  }

  public enable() {
    this._guildPlayer.on("playing", this.listener)
    this._guildPlayer.on("finish", this.listener)
    this._guildPlayer.on("trackAdd", this.listener)
    this._guildPlayer.on("volumeChange", this.listener)
    this._guildPlayer.on("clearQueue", this.listener)
    this._guildPlayer.on("pause", this.listener)
    this._guildPlayer.on("resume", this.listener)
    this._guildPlayer.on("playlistAdd", this.listener)
    this._guildPlayer.on("repeat", this.listener)
    this._guildPlayer.on("shuffle", this.listener)
    this._guildPlayer.on("jump", this.listener)
  }

  public disable() {
    this._guildPlayer.removeListener("playing", this.listener)
    this._guildPlayer.removeListener("finish", this.listener)
    this._guildPlayer.removeListener("trackAdd", this.listener)
    this._guildPlayer.removeListener("volumeChange", this.listener)
    this._guildPlayer.removeListener("clearQueue", this.listener)
    this._guildPlayer.removeListener("pause", this.listener)
    this._guildPlayer.removeListener("resume", this.listener)
    this._guildPlayer.removeListener("playlistAdd", this.listener)
    this._guildPlayer.removeListener("repeat", this.listener)
    this._guildPlayer.removeListener("shuffle", this.listener)
    this._guildPlayer.removeListener("jump", this.listener)
  }

  public listener = () => {
    this.update()
  }

  private async update() {
    if (this._guildPlayer && this._guildPlayer.queue.tracks.length) this.playingMessage()
    else this.emptyQueueMessage()
  }

  private playingMessage() {
    const track = this._guildPlayer.queue.playingNow

    const embed = new EmbedBuilder()
      .setImage(track.thumbnail)
      .setColor(palette.embed.main)
      .setTitle(
        `${this._guildPlayer.playing ? ":arrow_forward: " : ":pause_button: "} ${track.title}`
      )
      .setURL(track.url)
      .setDescription(`:sound: **${this._guildPlayer.volume} / 100**`)
      .addFields([
        {
          name: `Lista (${this._guildPlayer.queue.tracks.length}) (aprox ${this._guildPlayer.queue.totalDuration} minutos)`,
          value: this._guildPlayer.queue.tracks
            .slice(0, 10)
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
        text: `${track.metadata?.requester?.username}`,
        iconURL: track.metadata?.requester?.avatarURL() ?? undefined,
      })

    if (this._guildPlayer.repeat) {
      embed.addFields({
        name: ":repeat: Repetir",
        value: "Ativado",
        inline: true,
      })
    }

    if (this._guildPlayer.shuffle) {
      embed.addFields({
        name: ":twisted_rightwards_arrows: Aleatorio",
        value: "Ativado",
        inline: true,
      })
    }

    this._message.edit({ embeds: [embed] }).catch(console.error)
  }

  private emptyQueueMessage() {
    const embed = new EmbedBuilder()
      .setImage(this._guildPlayer.guild.client.user.avatarURL({ size: 512 }))
      .setColor(palette.embed.main)

    this._message.edit({ embeds: [embed] }).catch(console.error)
  }
}
