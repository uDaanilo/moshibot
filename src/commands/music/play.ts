import {
  CommandInteraction,
  Message,
  SelectMenuComponentOptionData,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js"
import GuildPlayer from "../../modules/music/guild_player"
import { isUrl } from "../../modules/music/providers/helpers"
import { YoutubeProvider } from "../../modules/music/providers/youtube"
import { BaseCommand, InteractionOptionType } from "../../types/global"
import isOnVoiceChannel from "../../utils/isOnVoiceChannel"

export default <BaseCommand>{
  name: "play",
  description: "Toca uma musica no canal de voz",
  alias: "p",
  args: "<nome ou url>",
  options: [
    {
      name: "nome",
      description: "Nome ou link da musica",
      required: true,
      type: InteractionOptionType.STRING,
    },
  ],
  async before(msg, next) {
    if (!isOnVoiceChannel(msg))
      return msg.reply(":warning: **|** Voce deve entrar em um canal de voz primeiro")

    return next()
  },
  async run(msg) {
    let query: string = ""

    if (msg instanceof Message) query = msg.args
    else if (msg instanceof CommandInteraction && msg.isCommand())
      query = msg.options.data.find((d) => d.name === "nome").value as string

    if (!msg.guild.player) msg.guild.player = new GuildPlayer(msg.guild)

    if ((msg as Message).cmd === "p" || isUrl(query)) return msg.guild.player.play(msg)

    const tracks = await new YoutubeProvider().searchByKeyword(query, 5)
    if (tracks.length === 0) return msg.reply(":warning: **|** Nenhuma musica encontrada")

    const labels: SelectMenuComponentOptionData[] = tracks.map((s) => ({
      default: false,
      description: s.author,
      label: s.title,
      value: s.url,
    }))

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId("tracks").setPlaceholder(query).addOptions(labels)
    )

    await msg.reply({
      content: "<:skip_next:859265681451515906> **|** Selecione uma musica",
      // @ts-ignore
      components: [row],
    })
  },
}
