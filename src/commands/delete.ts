/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Command } from "../interfaces/command.js";

export const deleteCommand: Command = {
  data: new SlashCommandBuilder().
    setName("delete").
    setDescription(
      // eslint-disable-next-line stylistic/max-len
      "Mark a task as deleted. WARNING: This will scrub all PII from the task and CANNOT be undone.",
    ).
    setContexts(InteractionContextType.Guild).
    addIntegerOption((option) => {
      return option.
        setName("id").
        setDescription("The ID of the task to delete.").
        setMinValue(1).
        setRequired(true);
    }),
  run: async(bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const numericalId = interaction.options.getInteger("id", true);
      const task = await bot.database.tasks.
        update({
          data: {
            assignees:   [],
            deleted:     true,
            description: "This task has been deleted.",
            dueAt:       new Date(),
            priority:    "deleted",
            tags:        [],
            title:       "Deleted Task",
          },
          where: { numericalId },
        }).
        catch(() => {
          return null;
        });
      await interaction.editReply({
        content: task
          ? `Task ${String(numericalId)} has been marked as deleted.`
          : `Task ${String(numericalId)} does not exist.`,
      });
    } catch (error) {
      await errorHandler(
        bot,
        "view command",
        error,
        interaction.replied
          ? interaction.editReply.bind(interaction)
          : interaction.reply.bind(interaction),
      );
    }
  },
};
