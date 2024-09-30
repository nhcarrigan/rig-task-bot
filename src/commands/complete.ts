/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Command } from "../interfaces/command.js";

export const complete: Command = {
  data: new SlashCommandBuilder().
    setName("complete").
    setDescription("Mark a task as completed.").
    setContexts(InteractionContextType.Guild).
    addIntegerOption((option) => {
      return option.
        setName("id").
        setDescription("The ID of the task to complete.").
        setMinValue(1).
        setRequired(true);
    }),
  run: async(bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const numericalId = interaction.options.getInteger("id", true);
      const task = await bot.database.tasks.update({
        data:  { completed: true },
        where: { numericalId },
      }).catch(() => {
        return null;
      });
      await interaction.editReply({
        content: task
          ? `Task ${String(numericalId)} has been marked as complete.`
          : `Task ${String(numericalId)} does not exist.`,
      });
    } catch (error) {
      await errorHandler(bot, "view command", error, interaction.replied
        ? interaction.editReply.bind(interaction)
        : interaction.reply.bind(interaction));
    }
  },
};
