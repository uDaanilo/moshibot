import {
  ButtonInteraction,
  CommandInteraction,
  Interaction,
  StringSelectMenuInteraction,
} from "discord.js"
import { client } from "../bot"
import { UserInteraction } from "../commands/userInteraction"
import buttonInteractionHandler from "./buttonInteraction"
import { EventHandler } from "./eventHandler"

export class InteractionHandler implements EventHandler {
  public handle(interaction: Interaction) {
    if (interaction.isCommand()) this.handleCommandInteraction(interaction)
    else if (interaction.isStringSelectMenu()) this.handleSelectMenuInteraction(interaction)
    else if (interaction.isButton()) this.handleButtonInteraction(interaction)
    else throw new Error(`Cannot handle interaction type ${interaction.type}`)
  }

  private handleCommandInteraction(commandInteraction: CommandInteraction) {
    const command = new UserInteraction(commandInteraction.commandName, {}, commandInteraction)

    client.commandsHandler.handle(command)
  }

  private handleSelectMenuInteraction(selectMenuInteraction: StringSelectMenuInteraction) {
    const command = new UserInteraction(selectMenuInteraction.customId, {}, selectMenuInteraction)

    client.commandsHandler.handle(command)
  }

  private handleButtonInteraction(buttonInteraction: ButtonInteraction) {
    const command = new UserInteraction(buttonInteraction.customId, null, buttonInteraction)
    buttonInteractionHandler(command)
  }
}
