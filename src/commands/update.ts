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

export const update: Command = {
  data: new SlashCommandBuilder().
    setName("update").
    setDescription("Update a task.").
    setContexts(InteractionContextType.Guild),
  run: async(bot, interaction) => {
    try {
      const number = new TextInputBuilder().
        setLabel("Task Number").
        setRequired(true).
        setStyle(TextInputStyle.Short).
        setCustomId("taskNumber");
      const title = new TextInputBuilder().
        setLabel("Title").
        setRequired(false).
        setStyle(TextInputStyle.Short).
        setCustomId("title");
      const description = new TextInputBuilder().
        setLabel("Description").
        setRequired(false).
        setStyle(TextInputStyle.Paragraph).
        setCustomId("description");
      const due = new TextInputBuilder().
        setLabel("Due Date").
        setRequired(false).
        setStyle(TextInputStyle.Short).
        setCustomId("dueDate");
      const rowZero = new ActionRowBuilder<TextInputBuilder>().addComponents(
        number,
      );
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
        setCustomId("update-task").
        setTitle("Update Task").
        addComponents(rowZero, rowOne, rowTwo, rowThree);
      await interaction.showModal(modal);
    } catch (error) {
      await errorHandler(bot, "update command", error, interaction.replied
        ? interaction.editReply.bind(interaction)
        : interaction.reply.bind(interaction));
    }
  },
};
