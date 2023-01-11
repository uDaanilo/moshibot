import { ButtonInteraction } from "discord.js"
import { Command } from "../types"
import isOnVoiceChannel from "../utils/isOnVoiceChannel"
import queueExists from "../utils/queueExists"

export default function (btn: ButtonInteraction) {
  ;(btn as Command).canDeferReply = () => false
  const { player } = btn.guild

  if (!isOnVoiceChannel(btn as Command)) {
    btn.reply(
      `:warning: **|** <@${btn.member.user.id}> Voce deve entrar em um canal de voz primeiro`
    )
    setTimeout(() => btn.deleteReply(), 15000)
    return
  }

  if (!queueExists(btn as Command)) {
    btn.reply(
      `:warning: **|** <@${btn.member.user.id}> Nao ha nada tocando para que seja possivel completar essa acao`
    )
    setTimeout(() => btn.deleteReply(), 15000)
    return
  }

  if (btn.customId === "playpause") {
    if (player.playing) {
      player.pause(btn as Command, false)
      btn.reply(`⏸ **|** <@${btn.member.user.id}>, Musica pausada!`)
    } else {
      player.resume(btn as Command, false)
      btn.reply(`:arrow_forward: **|** <@${btn.member.user.id}>, Musica resumida!`)
    }
  }

  if (btn.customId === "next") {
    player.jump(btn as Command, 1, false)
    btn.reply(`:fast_forward: **|** <@${btn.member.user.id}> pulou de musica`)
  }

  if (btn.customId === "stop") {
    player.stop(btn as Command, false)
    btn.reply(`:fast_forward: **|** <@${btn.member.user.id}> excluiu a playlist`)
  }

  if (btn.customId === "shuffle") {
    player.toggleShuffle(btn as Command, false)
    btn.reply(
      `:twisted_rightwards_arrows: **|** <@${btn.member.user.id}> ${
        player.shuffle ? "ativou" : "desativou"
      } o modo aleatorio`
    )
  }

  if (btn.customId === "repeat") {
    player.toggleRepeat(btn as Command, false)
    btn.reply(
      `:repeat: **|** <@${btn.member.user.id}> ${
        player.repeat ? "ativou" : "desativou"
      } o modo repeticao`
    )
  }
  setTimeout(() => btn.deleteReply(), 15000)
}
