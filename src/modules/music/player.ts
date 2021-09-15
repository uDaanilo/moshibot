import EventEmitter from "events"
import { IClient, IMessage, IServerQueue } from "../../types"
import Play from "./play"

type PlayerEvents = 'playing' | 'finish' | 'songAdd' | 'volumeChange' | 'clearQueue' | 'pause' | 'resume' | 'playlistAdd' | 'att' | 'repeat' | 'shuffle' | 'jump'
interface IPlayerEmitter extends EventEmitter {
  emit: (event: PlayerEvents | symbol, ...args: any[]) => any
  on: (event: PlayerEvents | symbol, ...args: any[]) => any
}

class Player {
  public queue: Map<string, IServerQueue> = new Map()
  private emitter: IPlayerEmitter = new EventEmitter()
  public on = this.emitter.on
  public emit = this.emitter.emit
  private client: IClient

  constructor(client) {
    this.client = client

    this.on('volumeChange', arg => this.emit('att', arg))
    this.on('songAdd', arg => this.emit('att', arg))
    this.on('resume', arg => this.emit('att', arg))
    this.on('playlistAdd', arg => this.emit('att', arg))
    this.on('playing', arg => this.emit('att', arg))
    this.on('pause', arg => this.emit('att', arg))
    this.on('finish', arg => this.emit('att', arg))
    this.on('clearQueue', arg => this.emit('att', arg))
    this.on('shuffle', arg => this.emit('att', arg))
    this.on('repeat', arg => this.emit('att', arg))
    this.on('jump', arg => this.emit('att', arg))

    this.onEveryoneLeave()
    this.onLeaveVoiceChannel()
  }

  private onEveryoneLeave() {
    var timeout

    this.client.on('voiceStateUpdate', (oldState, newState) => {
      const serverQueue = this.queue.get(newState.guild.id)

      if(serverQueue && serverQueue.connection && serverQueue.songs && serverQueue.songs.length > 3) {
        if(serverQueue.connection.channel.members.size == 1 && serverQueue.connection.channel.members.get(this.client.user.id)) {
            timeout = setTimeout(() => {
              //@ts-ignore
              this.stop(serverQueue.connection.channel)
            }, 60000)
  
            serverQueue.textChannel.send(':warning: **|** Todos membros sairam do canal de voz, excluindo playlist em 1 minuto')
          } else if(serverQueue.connection.channel.members.size > 1 && timeout && !timeout._destroyed) {
            serverQueue.textChannel.send(':ok_hand: **|** Contagem cancelada')
            clearTimeout(timeout)
          }
      }
    })
  }

  private onLeaveVoiceChannel() {
    this.client.on('voiceStateUpdate', (oldState, newState) => {
      const serverQueue = this.queue.get(oldState.guild.id)

      if(serverQueue && newState.member.user.id == this.client.user.id && !newState.member.voice.channel) {
        //@ts-ignore
        this.stop(oldState)
      }
    })
  }

  public play(msg: IMessage) {
    new Play(msg)
  }

  public setVolume(msg: IMessage, val: number) {
    const serverQueue = this.queue.get(msg.guild.id)

    this.emit('volumeChange', msg, serverQueue.volume, val)
    serverQueue.dispatcher.setVolumeLogarithmic(val / 100)
    serverQueue.volume = val
  }

  public skip(msg: IMessage, index: number | null = null) {
    const serverQueue = this.queue.get(msg.guild.id)
    
    if(index)
      serverQueue.songs = serverQueue.songs.slice(index - 1)

    serverQueue.dispatcher.end()

    this.emit('jump', msg)
  }

  public stop(msg: IMessage) {
    const serverQueue = this.queue.get(msg.guild.id)

    serverQueue.songs = []
    serverQueue.dispatcher.end()

    this.emit('clearQueue', msg)
  }

  public pause(msg: IMessage) {
    const serverQueue = this.queue.get(msg.guild.id)

    serverQueue.playing = false
    serverQueue.dispatcher.pause()
    serverQueue.dispatcher.resume()
    serverQueue.dispatcher.pause()
    
    this.emit('pause', msg)

  }

  public resume(msg: IMessage) {
    const serverQueue = this.queue.get(msg.guild.id)

    serverQueue.playing = true
    serverQueue.dispatcher.resume()
    serverQueue.dispatcher.pause()
    serverQueue.dispatcher.resume()

    this.emit('resume', msg)
  }

  public setFilter(msg, filter) {
    const serverQueue = this.queue.get(msg.guild.id)

    if(serverQueue.songs && serverQueue.songs[0].live) return

    serverQueue.filters = filter
    new Play(msg, true)
  }

  public setRepeat(msg: IMessage) {
    const serverQueue = this.queue.get(msg.guild.id)

    serverQueue.repeat = !serverQueue.repeat

    this.emit('repeat', msg)
  }

  public setShuffle(msg: IMessage) {
    const serverQueue = this.queue.get(msg.guild.id)

    serverQueue.shuffle = !serverQueue.shuffle

    this.emit('shuffle', msg)
  }
}

export default Player