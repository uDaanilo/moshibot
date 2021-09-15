import { Client, Guild, Message, StreamDispatcher, TextChannel, User, VoiceChannel, VoiceConnection } from "discord.js";
import { Readable } from "stream";
import CommandsHandler from "./commands";
import Player from "./modules/music/player";

export interface IClient extends Client {
  player?: Player,
  cmdsHandler?: CommandsHandler
}

export interface ISong {
  title: string
  url: string
  duration: string | number
  lengthSeconds: number
  thumbnail: string,
  channel: string
  requester?: User
  stream?: () => Promise<Readable>
  live?: boolean
}

export interface IServerQueue {
  textChannel: TextChannel
  voiceChannel: VoiceChannel,
  guild?: Guild,
  dispatcher?: StreamDispatcher,
  songs: ISong[]
  volume: number
  playing: boolean
  filters?: string
  connection?: VoiceConnection
  streamTime?: number
  repeat: boolean
  shuffle: boolean
}
export interface IMessage extends Message {
  args?: string
  cmd?: string
  client: IClient
}

export interface ICommand {
  command: string
  args: string
  alias: string
  devOnly: boolean
  run: (msg: IMessage) => any
}