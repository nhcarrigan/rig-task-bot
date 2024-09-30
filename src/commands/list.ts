/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Command } from "../interfaces/command.js";
import type { Prisma } from "@prisma/client";

export const list: Command = {
  data: new SlashCommandBuilder().
    setName("list").
    setDescription("List all tasks, with optional filters.").
    setContexts(InteractionContextType.Guild).
    addStringOption((option) => {
      return option.
        setName("priority").
        setDescription("List tasks under this priority.").
        setRequired(false).
        addChoices(
          { name: "Low", value: "low" },
          { name: "Medium", value: "medium" },
          { name: "High", value: "high" },
          { name: "Critical", value: "critical" },
          { name: "None", value: "none" },
        );
    }).
    addStringOption((option) => {
      return option.
        setName("tag").
        setDescription("List tasks with this tag.").
        setRequired(false);
    }).
    addUserOption((option) => {
      return option.
        setName("assignee").
        setDescription("List tasks assigned to this user.").
        setRequired(false);
    }).
    addBooleanOption((option) => {
      return option.
        setName("completed").
        setDescription("List completed tasks.").
        setRequired(false);
    }),
  run: async(bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const priority = interaction.options.getString("priority");
      const tag = interaction.options.getString("tag");
      const assignee = interaction.options.getUser("assignee");
      const completed = interaction.options.getBoolean("completed") ?? false;
      const query: Prisma.TasksWhereInput = {
        completed: completed,
        deleted:   false,
      };
      if (priority !== null) {
        query.priority = priority;
      }
      if (tag !== null) {
        query.tags = { has: tag };
      }
      if (assignee !== null) {
        query.assignees = { has: assignee.id };
      }
      const tasks = await bot.database.tasks.findMany({
        where: query,
      });
      const taskList = tasks.sort((a, b) => {
        return a.dueAt.getTime() - b.dueAt.getTime();
      }).map((task) => {
        return `- Task ${String(task.numericalId)}: ${task.title}`;
      });
      await interaction.editReply({
        content: taskList.length > 0
          ? taskList.join("\n")
          : "No tasks found with this current filter.",
      });
    } catch (error) {
      await errorHandler(bot, "list command", error, interaction.replied
        ? interaction.editReply.bind(interaction)
        : interaction.reply.bind(interaction));
    }
  },
};
