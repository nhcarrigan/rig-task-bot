/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import type { Command } from "../interfaces/command.js";

/**
 * Default handler to fall back to in the event a command
 * is not found. This can happen if we delete command logic in the code
 * but do not register the updates.
 * @param _bot - The bot instance, unused here but necessary to match the type signatures.
 * @param interaction - The interaction payload from Discord.
 */
export const defaultCommand: Command["run"] = async(_bot, interaction) => {
  await interaction.reply({
    content:   `Interaction ${interaction.commandName} not found.`,
    ephemeral: true,
  });
};
