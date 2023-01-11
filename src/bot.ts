import { ChannelType, Client, GatewayIntentBits } from "discord.js"
import CommandsHandler from "./commands"
import Ready from "./events/ready"
import buttonInteraction from "./events/buttonInteraction"
import { Command } from "./types"
import messageCreate from "./events/messageCreate"

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
})

client.login(process.env.TOKEN)

client.commandsHandler = new CommandsHandler()

client.once("ready", () => {
  const readyEvent = new Ready(client)

  readyEvent.handle()
})

client.on("interactionCreate", async (interaction) => {
  ;(interaction as Command).canDeferReply = () => true

  if (interaction.isStringSelectMenu()) {
    ;(interaction as Command).args = interaction.values.join(" ")

    if (interaction.customId === "tracks") interaction.guild.player.play(interaction as Command)
  }

  if (interaction.isButton()) return buttonInteraction(interaction)
  if (interaction.isCommand()) return client.commandsHandler.handle(interaction)
})

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return
  if (msg.channel.type === ChannelType.DM) return

  messageCreate(msg)
})

export { client }
