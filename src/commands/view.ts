/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Command } from "../interfaces/command.js";

export const view: Command = {
  data: new SlashCommandBuilder().
    setName("view").
    setDescription("View a task by its ID.").
    setContexts(InteractionContextType.Guild).
    addIntegerOption((option) => {
      return option.
        setName("id").
        setDescription("The ID of the task to view.").
        setMinValue(1).
        setRequired(true);
    }),
  run: async(bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const numericalId = interaction.options.getInteger("id", true);
      const task = await bot.database.tasks.findUnique({
        where: { numericalId },
      });
      if (!task) {
        await interaction.editReply({ content: `Task ${String(numericalId)} not found.` });
        return;
      }
      if (task.deleted) {
        await interaction.editReply({ content: `Task ${String(numericalId)} has been deleted.` });
        return;
      }
      await interaction.editReply({ embeds: [
        {
          description: task.description,
          fields:      [
            { inline: true, name: "Priority", value: task.priority },
            { inline: true, name:   "Completed", value:  task.completed
              ? "Yes"
              : "No" },
            { name: "Tag", value: task.tags.join(", ") },
            { name:  "Assignee", value: task.assignees.map((id) => {
              return `<@${id}>`;
            }).join(", ") },

          ],
          title: `Task ${String(task.numericalId)}`,
        },
      ] });
    } catch (error) {
      await errorHandler(bot, "view command", error, interaction.replied
        ? interaction.editReply.bind(interaction)
        : interaction.reply.bind(interaction));
    }
  },
};
