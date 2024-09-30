/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import type { Bot } from "../interfaces/bot.js";
import type { MessageCreateOptions } from "discord.js";

/**
 * Quick wrapper to send a debug message to the webhook.
 * Modularised for future expansion if needed.
 * @param bot -- The bot object, containing the webhook client.
 * @param message -- The message payload, compatible with Discord's API.
 */
export const sendDebugLog = async(
  bot: Bot,
  message: MessageCreateOptions,
): Promise<void> => {
  await bot.env.discordDebugWebhook.send({
    ...message,
    avatarURL:
      bot.discord.user?.displayAvatarURL()
      ?? "https://cdn.nhcarrigan.com/profile.png",
    username: bot.discord.user?.username ?? "RIG Task Bot",
  });
};
