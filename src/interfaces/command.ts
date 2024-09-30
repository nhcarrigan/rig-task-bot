/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import type { Bot } from "./bot.js";
import type { ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder }
  from "discord.js";

export interface Command {
  data: SlashCommandOptionsOnlyBuilder;
  run:  (bot: Bot, interaction:
  ChatInputCommandInteraction<"cached">)=> Promise<void>;
}
