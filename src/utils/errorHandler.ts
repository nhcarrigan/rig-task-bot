/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import {
  EmbedBuilder,
  SnowflakeUtil,
  type ChatInputCommandInteraction,
} from "discord.js";
import { sendDebugLog } from "./sendDebugLog.js";
import type { Bot } from "../interfaces/bot.js";

/**
 * Parses an error event (re: from a catch block). If it
 * is a proper Error object, extrapolates data. Sends information
 * to the debug webhook, and assigns the error a Snowflake ID.
 * Optionally forwards the ID to the user through a reply function.
 * @param bot -- The bot object, containing the webhook client.
 * @param context -- A brief description of the code module that threw the error.
 * @param error -- The error payload, typed as unknown to comply with TypeScript's typedef.
 * @param reply - OPTIONAL: A function to use to send the ID back to the user.
 * @returns The Snowflake ID assigned to the error.
 */
export const errorHandler = async(
  bot: Bot,
  context: string,
  error: unknown,
  reply?:
    | ChatInputCommandInteraction["reply"]
    | ChatInputCommandInteraction["editReply"],
// eslint-disable-next-line @typescript-eslint/max-params
): Promise<string> => {
  const id = SnowflakeUtil.generate();
  const embed = new EmbedBuilder();
  embed.setFooter({ text: `Error ID: ${id.toString()}` });
  embed.setTitle(`Error: ${context}`);
  if (error instanceof Error) {
    embed.setDescription(error.message);
    embed.addFields([
      { name: "Stack", value: `\`\`\`\n${String(error.stack).slice(0, 1000)}` },
    ]);
  } else {
    embed.setDescription(String(error).slice(0, 2000));
  }
  await sendDebugLog(bot, { embeds: [ embed ] });
  if (reply) {
    const content = `Oops! Something went wrong! Please reach out to us in our [support server](https://chat.nhcarrigan.com) and bring this error ID: ${id.toString()}`;
    await reply({ content: content, ephemeral: true });
  }
  return id.toString();
};
