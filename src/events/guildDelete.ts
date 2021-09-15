import Guild from "../db/models/Guild";
import { Guild as DCGuild } from 'discord.js';

async function GuildDelete(guild: DCGuild) {
  await Guild.findOneAndDelete({ id: guild.id })
}

export default GuildDelete