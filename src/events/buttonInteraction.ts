import { ButtonInteraction } from "discord.js"
import isOnVoiceChannel from "../utils/isOnVoiceChannel"
import queueExists from "../utils/queueExistsOnGuild"
import { UserInteraction } from "../commands/userInteraction"

export default function (userInteraction: UserInteraction<any, ButtonInteraction>) {
  const { interaction } = userInteraction
  const { player } = interaction.guild

  if (!isOnVoiceChannel(interaction)) {
    userInteraction.reply(
      `:warning: **|** <@${interaction.member.user.id}> Voce deve entrar em um canal de voz primeiro`
    )
    setTimeout(() => interaction.deleteReply(), 15000)
    return
  }

  if (!queueExists(interaction)) {
    userInteraction.reply(
      `:warning: **|** <@${interaction.member.user.id}> Nao ha nada tocando para que seja possivel completar essa acao`
    )
    setTimeout(() => interaction.deleteReply(), 15000)
    return
  }

  if (interaction.customId === "playpause") {
    if (player.playing) {
      player.pause()
      userInteraction.reply(
        `:pause_button: **|** <@${interaction.member.user.id}>, Musica pausada!`
      )
    } else {
      player.resume()
      userInteraction.reply(
        `:arrow_forward: **|** <@${interaction.member.user.id}>, Musica resumida!`
      )
    }
  }

  if (interaction.customId === "next") {
    player.jump()
    interaction.reply(`:fast_forward: **|** <@${interaction.member.user.id}> pulou de musica`)
  }

  if (interaction.customId === "stop") {
    player.stop()
    interaction.reply(`:fast_forward: **|** <@${interaction.member.user.id}> excluiu a playlist`)
  }

  if (interaction.customId === "shuffle") {
    player.toggleShuffle()
    interaction.reply(
      `:twisted_rightwards_arrows: **|** <@${interaction.member.user.id}> ${
        player.shuffle ? "ativou" : "desativou"
      } o modo aleatorio`
    )
  }

  if (interaction.customId === "repeat") {
    player.toggleRepeat()
    interaction.reply(
      `:repeat: **|** <@${interaction.member.user.id}> ${
        player.repeat ? "ativou" : "desativou"
      } o modo repeticao`
    )
  }
  setTimeout(() => interaction.deleteReply(), 15000)
}
