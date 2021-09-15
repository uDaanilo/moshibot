import { VoiceChannel } from "discord.js";
import { IServerQueue, IMessage } from "../../types";
import ytdl from 'discord-ytdl-core'
import SongMessages from './SongMessages'
import { Readable } from "stream";
import GetSongInfo from "./getSongInfo";

class Play {
  private voiceChannel: VoiceChannel

  constructor(msg: IMessage, updateFilters = false) {
    if(updateFilters) {
      this.PlayStream(msg, true)
      return
    }

    const serverQueue = msg.client.player.queue.get(msg.guild.id)
    this.voiceChannel = msg.member?.voice.channel

    if(!this.voiceChannel) {
      msg.channel.send(":warning: **|** Voce deve estar em um canal de voz")
      return
    }

    if(msg.args.length <= 2) {
      msg.channel.send(':warning: **|** Argumento deve ser maior ou igual a 3')
      return
    }

    const queueTemplate: IServerQueue = {
      textChannel: msg.channel,
      voiceChannel: this.voiceChannel,
      guild: msg.guild || undefined,
      playing: true,
      songs: [],
      volume: 100,
      dispatcher: undefined,
      streamTime: 0,
      repeat: false,
      shuffle: false
    }

    const getSongInfo = new GetSongInfo()
    getSongInfo.init(msg)
      .then(song => {
        if(serverQueue) {
          if(Array.isArray(song)) {
            serverQueue.songs = serverQueue.songs.concat(song)

            msg.channel.send(SongMessages.add(song[0]))
          } else {
            serverQueue.songs.push(song)

            msg.channel.send(SongMessages.add(song))
          }
          
          msg.client.player.emit('songAdd', msg)

          return
        } else if(Array.isArray(song)) {
          queueTemplate.songs = song
  
          msg.client.player?.queue.set(msg.guild?.id, queueTemplate)
        } else {
          queueTemplate.songs.push(song)
  
          msg.client.player?.queue.set(msg.guild?.id, queueTemplate)
        }

        this.PlayStream(msg)
      })
      .catch(err => {
        if(err instanceof Error) {
          if(err.message == 'Song not found')
            return msg.channel.send(':warning: **|** Musica nao encontrada')
        } else {
          if(err == 'Invalid url')
            return msg.channel.send(':warning: **|** URL Invalida')
        }
          
        console.log(err)
        msg.channel.send(':bangbang: **|** Ocorreu um erro')
      })
  }

  public async PlayStream(msg: IMessage, updateFilter: boolean = false): Promise<void> {
    const serverQueue: IServerQueue = msg.client.player?.queue.get(msg.guild.id)
    const song = serverQueue.songs[0]
    var stream: Readable

    if(!song) {
      serverQueue.voiceChannel.leave()
      msg.client.player.queue.delete(msg.guild.id)
      return
    }
    if(updateFilter) {
      serverQueue.streamTime = serverQueue.dispatcher.streamTime + serverQueue.streamTime
      serverQueue.dispatcher.destroy()
    }
    if(!serverQueue.connection) {
      const connection = await this.voiceChannel.join()
      serverQueue.connection = connection
    }
    if(serverQueue.songs.length && !updateFilter) {
      msg.channel.send(SongMessages.play(song))
    }
    if(song.stream){
      stream = ytdl.arbitraryStream(await song.stream(), {
        opusEncoded: true,
        //@ts-ignore
        encoderArgs: serverQueue.filters ? ['-af', serverQueue.filters] : '',
        seek: (serverQueue.streamTime ? serverQueue.streamTime : 0) / 1000,
      })
    } else {
      //@ts-ignore
      stream = ytdl(song.url, {
        opusEncoded: true,
        filter: !song.live ? 'audioonly' : null,
        highWaterMark: 1 << 25,
        encoderArgs: serverQueue.filters ? ['-af', serverQueue.filters] : '',
        seek: (serverQueue.streamTime ? serverQueue.streamTime : 0) / 1000,
      })
    }

    msg.client.player.emit('playing', msg)

    const dispatcher = serverQueue.connection.play(stream, { type: 'opus' })
    serverQueue.dispatcher = dispatcher

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100)

    dispatcher.on('finish', () => {
      serverQueue.streamTime = 0
      serverQueue.filters = null
      msg.client.player.emit('finish', msg)

      if(!serverQueue.songs || !serverQueue.songs.length) {
        msg.client.player.queue.delete(msg.guild.id)
        serverQueue.voiceChannel.leave()
        return
      }

      serverQueue.songs && !serverQueue.repeat ? serverQueue.songs.shift() : []

      if(serverQueue.shuffle && !serverQueue.repeat) {
        const rng = parseInt((Math.random() * (serverQueue.songs.length - 1)).toString())

        serverQueue.songs.unshift(serverQueue.songs[rng])
        serverQueue.songs.splice(rng + 1, 1)
      }

      this.PlayStream(msg)
    })

    dispatcher.on('error', err => {
      console.log(err)
      serverQueue.songs ? serverQueue.songs.shift() : []

      if(serverQueue.songs.length > 1)
        msg.reply(`:bangbang: **|** Ocorreu um erro com **${song.title}**, pulando para proxima faixa`)

      dispatcher.end()
    })
  }
}

export default Play