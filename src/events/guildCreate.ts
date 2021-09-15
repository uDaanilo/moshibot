import Guild from "../db/models/Guild";
import { Guild as DCGuild } from 'discord.js';

async function GuildCreate(guild: DCGuild) {
  const newGuild = new Guild({
    id: guild.id,
    name: guild.name,
    population: guild.memberCount,
    owner: guild.ownerID
  })
  
  await newGuild.save()
}

export default GuildCreate