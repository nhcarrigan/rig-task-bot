/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Command } from "../interfaces/command.js";

export const assign: Command = {
  data: new SlashCommandBuilder().
    setName("assign").
    setDescription("Add or remove someone as a task assignee.").
    setContexts(InteractionContextType.Guild).
    addIntegerOption((option) => {
      return option.
        setName("task").
        setDescription("The task number.").
        setMinValue(1).
        setRequired(true);
    }).
    addUserOption((option) => {
      return option.
        setName("assignee").
        setDescription("The user to (un)assign.").
        setRequired(true);
    }),
  run: async(bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const numericalId = interaction.options.getInteger("task", true);
      const user = interaction.options.getUser("assignee", true).id;
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
      const shouldRemove = task.assignees.includes(user);
      await bot.database.tasks.update({
        data: shouldRemove
          ? {
            assignees: task.assignees.filter((u) => {
              return u !== user;
            }),
          }
          : {
            assignees: {
              push: user,
            },
          },
        where: {
          numericalId,
        },
      });
      await interaction.editReply({
        content: `User <@${user}> ${shouldRemove
          ? "unassigned from"
          : "assigned to"} task ${String(numericalId)}.`,
      });
    } catch (error) {
      await errorHandler(bot, "assign command", error, interaction.replied
        ? interaction.editReply.bind(interaction)
        : interaction.reply.bind(interaction));
    }
  },
};
