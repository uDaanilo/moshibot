import dotenv from 'dotenv'
dotenv.config()

import { Client } from 'discord.js'
import { IClient } from './types'

import onMessage from './events/message'
import onReady from './events/ready'

import './db'
import GuildCreate from './events/guildCreate'
import GuildDelete from './events/guildDelete'
import Player from './modules/music/player'

const client: IClient = new Client()
client.player = new Player(client)

client.once('ready', () => new onReady(client))
client.on('message', msg => new onMessage(msg))
client.on('guildCreate', GuildCreate)
client.on('guildDelete', GuildDelete)

client.login(process.env.TOKEN)