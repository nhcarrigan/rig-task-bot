/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Command } from "../interfaces/command.js";

export const tag: Command = {
  data: new SlashCommandBuilder().
    setName("tag").
    setDescription("Add or remove a tag from a task.").
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
        setName("tag").
        setDescription("The tag.").
        setRequired(true);
    }),
  run: async(bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const numericalId = interaction.options.getInteger("task", true);
      const tagName = interaction.options.getString("tag", true);
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
      const shouldRemove = task.tags.includes(tagName);
      await bot.database.tasks.update({
        data: shouldRemove
          ? {
            tags: task.tags.filter((t) => {
              return t !== tagName;
            }),
          }
          : {
            tags: {
              push: tagName,
            },
          },
        where: {
          numericalId,
        },
      });
      await interaction.editReply({
        content: `Tag ${tagName} ${shouldRemove
          ? "removed from"
          : "added to"} task ${String(numericalId)}.`,
      });
    } catch (error) {
      await errorHandler(bot, "tag command", error, interaction.replied
        ? interaction.editReply.bind(interaction)
        : interaction.reply.bind(interaction));
    }
  },
};
