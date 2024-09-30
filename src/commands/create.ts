/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import {
  ActionRowBuilder,
  InteractionContextType,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Command } from "../interfaces/command.js";

export const create: Command = {
  data: new SlashCommandBuilder().
    setName("create").
    setDescription("Create a new task.").
    setContexts(InteractionContextType.Guild),
  run: async(bot, interaction) => {
    try {
      const title = new TextInputBuilder().
        setLabel("Title").
        setRequired(true).
        setStyle(TextInputStyle.Short).
        setCustomId("title");
      const description = new TextInputBuilder().
        setLabel("Description").
        setRequired(true).
        setStyle(TextInputStyle.Paragraph).
        setCustomId("description");
      const due = new TextInputBuilder().
        setLabel("Due Date").
        setRequired(true).
        setStyle(TextInputStyle.Short).
        setCustomId("dueDate");
      const rowOne = new ActionRowBuilder<TextInputBuilder>().addComponents(
        title,
      );
      const rowTwo = new ActionRowBuilder<TextInputBuilder>().addComponents(
        description,
      );
      const rowThree = new ActionRowBuilder<TextInputBuilder>().addComponents(
        due,
      );
      const modal = new ModalBuilder().
        setCustomId("create-task").
        setTitle("New Task").
        addComponents(rowOne, rowTwo, rowThree);
      await interaction.showModal(modal);
    } catch (error) {
      await errorHandler(bot, "create command", error, interaction.replied
        ? interaction.editReply.bind(interaction)
        : interaction.reply.bind(interaction));
    }
  },
};
