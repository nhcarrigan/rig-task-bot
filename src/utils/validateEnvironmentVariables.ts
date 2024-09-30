
/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { WebhookClient } from "discord.js";
import type { Bot } from "../interfaces/bot.js";

/**
 * Confirms that environment variables are not undefined. If
 * they are, throw an error to halt the program.
 * @returns The environment variables, structured for the top-level bot to cache.
 * @throws A ReferenceError for any missing variables, with a message indicating the missing variable.
 */
export const validateEnvironmentVariables = (): Bot["env"] => {
  if (process.env.DISCORD_TOKEN === undefined
    || process.env.DISCORD_TOKEN === "") {
    throw new ReferenceError("DISCORD_TOKEN cannot be undefined.");
  }

  if (process.env.DISCORD_DEBUG_WEBHOOK === undefined
    || process.env.DISCORD_DEBUG_WEBHOOK === "") {
    throw new ReferenceError("DISCORD_DEBUG_WEBHOOK cannot be undefined.");
  }

  if (process.env.MONGO_URI === undefined
    || process.env.MONGO_URI === "") {
    throw new ReferenceError("MONGO_URI cannot be undefined.");
  }

  return {
    discordDebugWebhook:
      new WebhookClient({ url: process.env.DISCORD_DEBUG_WEBHOOK }),
    discordToken: process.env.DISCORD_TOKEN,
    mongoUri:     process.env.MONGO_URI,
  };
};
