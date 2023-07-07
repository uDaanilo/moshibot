import CommandsHandler from "../../commands"
import { IGuild } from "../../db/models/Guild"
import GuildPlayer from "../../modules/music/guild_player"

declare module "discord.js" {
  interface Client extends Client {
    commandsHandler: CommandsHandler
  }

  interface Guild extends Guild {
    db?: IGuild
    player?: GuildPlayer
  }

  interface Message extends Message {
    args?: string
    cmd?: string
    canDeferReply: () => false
  }
}
