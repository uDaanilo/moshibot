import { Client, GatewayIntentBits } from "discord.js"
import Ready from "./events/ready"
import MessageCreate from "./events/messageCreate"
import { InteractionHandler } from "./events/interactionHandler"

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
})

client.login(process.env.TOKEN)

client.once("ready", () => {
  const readyEvent = new Ready(client)
  readyEvent.handle()
})

client.on("interactionCreate", async (interaction) => {
  const interactionHandler = new InteractionHandler()
  interactionHandler.handle(interaction)
})

client.on("messageCreate", (msg) => {
  const messageHandler = new MessageCreate()
  messageHandler.handle(msg)
})

export { client }
