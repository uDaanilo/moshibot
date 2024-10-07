import {
  SelectMenuComponentOptionData,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Message,
} from "discord.js"
import { isUrl } from "../../modules/music/providers/helpers"
import { YoutubeProvider } from "../../modules/music/providers/youtube"
import { InteractionOptionType } from "../../types/global"
import { BaseCommand } from "../baseCommand"
import { UserInteraction } from "../userInteraction"
import { isOnVoiceChannel } from "../../utils/isOnVoiceChannel"

export type PlayCommandOptions = {
  nome: string
}

export default class PlayCommand extends BaseCommand<PlayCommandOptions> {
  constructor() {
    super({
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
      before: [isOnVoiceChannel],
    })
  }

  public async run(userInteraction: UserInteraction<PlayCommandOptions, Message>) {
    const { interaction } = userInteraction

    if (userInteraction.commandName === "p" || isUrl(userInteraction.options.nome))
      return interaction.guild?.player.playOnVoiceChannel(userInteraction)

    const tracks = await new YoutubeProvider().searchByKeyword(userInteraction.options.nome, 5)
    if (tracks.length === 0)
      return userInteraction.reply(":warning: **|** Nenhuma musica encontrada")

    const labels: SelectMenuComponentOptionData[] = tracks.map((s) => ({
      default: false,
      description: s.author,
      label: s.title,
      value: s.url,
    }))

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("play")
        .setPlaceholder(userInteraction.options.nome)
        .addOptions(labels)
    )

    await userInteraction.reply({
      content: "<:skip_next:859265681451515906> **|** Selecione uma musica",
      // @ts-ignore
      components: [row],
    })
  }
}
