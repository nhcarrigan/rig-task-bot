/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Command } from "../interfaces/command.js";

export const priority: Command = {
  data: new SlashCommandBuilder().
    setName("priority").
    setDescription("Set the priority of a task.").
    setContexts(InteractionContextType.Guild).
    addIntegerOption((option) => {
      return option.
        setName("task").
        setDescription("The task number.").
        setMinValue(1).
        setRequired(true);
    }).
    addStringOption((option) => {
      return option.
        setName("priority").
        setDescription("The priority level.").
        setRequired(true).
        addChoices(
          { name: "Low", value: "low" },
          { name: "Medium", value: "medium" },
          { name: "High", value: "high" },
          { name: "Critical", value: "critical" },
          { name: "None", value: "none" },
        );
    }),
  run: async(bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const numericalId = interaction.options.getInteger("task", true);
      const priorityValue = interaction.options.getString("priority", true);
      const task = await bot.database.tasks.findFirst({
        where: {
          numericalId,
        },
      });
      if (!task) {
        await interaction.editReply({
          content: `Task ${String(numericalId)} not found.`,
        });
        return;
      }
      await bot.database.tasks.update({
        data: {
          priority: priorityValue,
        },
        where: {
          numericalId,
        },
      });
      await interaction.editReply({
        content: `Task ${String(numericalId)} priority set to ${priorityValue}.`,
      });
    } catch (error) {
      await errorHandler(bot, "priority command", error, interaction.replied
        ? interaction.editReply.bind(interaction)
        : interaction.reply.bind(interaction));
    }
  },
};
