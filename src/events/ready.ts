import { ActivityOptions, ActivityType, Client } from "discord.js"
import Guild from "../db/models/Guild"
import { logger } from "../utils/logger"
import GuildPlayer from "../modules/music/guild_player"
import { EventHandler } from "./eventHandler"
import CommandsHandler from "../commands"

class Ready implements EventHandler {
  constructor(private client: Client) {}

  public handle() {
    logger.info("[BOT] Ready!")
    logger.info(`[BOT] Logged as ${this.client.user.username}`)

    this.startCommandsHandler()
    this.setStatus(15)
    this.setDatabaseInfoIntoGuildCollection().then(() => {
      this.setGuildPlayers()
    })
  }

  private startCommandsHandler() {
    this.client.commandsHandler = new CommandsHandler()
  }

  private setStatus(interval: number): void {
    let status: ActivityOptions[] = [
      {
        name: "você",
        type: ActivityType.Watching,
      },
      {
        name: "venom extreme",
        type: ActivityType.Watching,
      },
      {
        name: "Minecraft",
        type: ActivityType.Playing,
      },
    ]

    status = status.map((s) => ({ ...s, name: `${s.name}` }))

    let i = 0
    this.client.user.setActivity(status[i].name, { type: status[i].type })

    setInterval(() => {
      if (i >= status.length - 1) i = 0
      else i++

      this.client.user.setActivity(status[i].name, { type: status[i].type })
    }, interval * 60000)
  }

  private async setDatabaseInfoIntoGuildCollection(): Promise<void> {
    await Promise.all(
      this.client.guilds.cache.map(async (g) => {
        try {
          let gdb = await Guild.findOne({ id: g.id })

          if (!gdb) {
            gdb = await Guild.create({
              id: g.id,
              name: g.name,
              owner: g.ownerId,
              population: g.memberCount,
            })
          }

          g.db = gdb
          this.client.guilds.cache.set(g.id, g)
        } catch (err) {
          logger.fatal(err)
        }
      })
    )
  }

  private setGuildPlayers() {
    this.client.guilds.cache.forEach((g) => {
      g.player = new GuildPlayer(g)
    })
  }
}

export default Ready
