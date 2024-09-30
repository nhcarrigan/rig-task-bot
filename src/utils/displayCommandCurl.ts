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
import type { Bot } from "../interfaces/bot.js";

/**
 * Generates a CURL string which can be used to register the bot's commands.
 * This is done manually - you should never register commands on something like the ready event.
 * Normally, we would register in response to an owner command, but this bot will not be using
 * the messgae content intent and we have no desire to parse a ping-prefixed message.
 * @param bot - The bot object, needed only to dynamically load the ID. The token is NOT loaded, for security.
 * @returns A CURL string which can be used in a terminal to register the bot's commands.
 */
export const displayCommandCurl = (bot: Bot): string => {
  const commands = [
    create,
    update,
    priority,
    tag,
    assign,
    list,
    view,
    complete,
    deleteCommand,
  ].map((c) => {
    return c.data.toJSON();
  });
  const url = `https://discord.com/api/v10/applications/${bot.discord.user?.id ?? "{ID}"}/commands`;
  const method = "PUT";
  const headers = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Authorization": `Bot {TOKEN}`,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Content-Type":  "application/json",
  };
  const body = JSON.stringify(commands);
  return `curl -X ${method} -H ${Object.entries(headers).
    map(([ k, v ]) => {
      return `"${k}: ${v}"`;
    }).
    join(" -H ")} --data '${body}' ${url}`;
};
