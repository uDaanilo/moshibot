import { ActivityOptions } from "discord.js";
import CommandsHandler from "../commands";
import { IClient } from "../types";

class onReady {
  private client: IClient

  constructor(client) {
    console.log('[BOT] READY!!!')
    console.log(`[BOT] LOGGED AS ${client.user.username}`)

    this.client = client

    this.setCommands()
    this.setStatus(15)
  }

  private setCommands() {
    const cmdsHandler = new CommandsHandler()

    this.client.cmdsHandler = cmdsHandler

    this.client.cmdsHandler.registerCommands()
  }

  private setStatus(time: number): void {
    let status: ActivityOptions[] = [
      {
          name: "você",
          type: "WATCHING",
      },
      {
          name: "venom extreme",
          type: "WATCHING",
      },
      {
          name: "Minecraft",
          type: "PLAYING"
      }
    ]
    
    let i = 0
    this.client.user.setActivity(status[i].name, { type: status[i].type })

    setInterval(() => {
      if (i >= (status.length - 1)) {
        i = 0
      } else {
        i++
      }

      this.client.user.setActivity(status[i].name, { type: status[i].type })
    }, time * 60000) 
  }
} 

export default onReady