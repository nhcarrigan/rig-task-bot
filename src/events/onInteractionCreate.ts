/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { assign } from "../commands/assign.js";
import { complete } from "../commands/complete.js";
import { create } from "../commands/create.js";
import { deleteCommand } from "../commands/delete.js";
import { list } from "../commands/list.js";
import { priority } from "../commands/priority.js";
import { tag } from "../commands/tag.js";
import { update } from "../commands/update.js";
import { view } from "../commands/view.js";
import { defaultCommand } from "../modules/defaultCommand.js";
import {
  createModal,
  defaultModal,
  updateModal,
  type ModalHandler,
} from "../modules/modalHandlers.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Bot } from "../interfaces/bot.js";
import type { Command } from "../interfaces/command.js";
import type { Interaction } from "discord.js";

const commandMap: Record<string, Command> = {
  assign:   assign,
  complete: complete,
  create:   create,
  delete:   deleteCommand,
  list:     list,
  priority: priority,
  tag:      tag,
  update:   update,
  view:     view,
};

const modalMap: Record<string, ModalHandler> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "create-task": createModal,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "update-task": updateModal,
};

/**
 * Handles all of the logic for interactions.
 * If it's a slash command and we have the guild, try to run it.
 * @param bot - The bot object, which contains the database and Discord client.
 * @param interaction - The interaction payload from Discord.
 */
export const onInteractionCreate
  // eslint-disable-next-line complexity
  = async(bot: Bot, interaction: Interaction): Promise<void> => {
    try {
      if (interaction.isChatInputCommand()) {
        if (!interaction.inCachedGuild()) {
          await interaction.reply({
            content:   "How did you run this out of a guild?",
            ephemeral: true,
          });
          return;
        }
        const command
          = commandMap[interaction.commandName]?.run ?? defaultCommand;
        await command(bot, interaction);
        return;
      }

      if (interaction.isModalSubmit()) {
        if (!interaction.inCachedGuild()) {
          await interaction.reply({
            content:   "How did you get a modal outside of a guild?",
            ephemeral: true,
          });
          return;
        }
        const handler = modalMap[interaction.customId] ?? defaultModal;
        await handler(bot, interaction);
        return;
      }

      throw new Error("Unknown interaction type.");
    } catch (error) {
      if (interaction.isAutocomplete()) {
        await errorHandler(bot, "discord on interaction event", error);
        return;
      }
      await errorHandler(
        bot,
        "discord on interaction event",
        error,
        interaction.replied
          ? interaction.editReply.bind(interaction)
          : interaction.reply.bind(interaction),
      );
    }
  };
