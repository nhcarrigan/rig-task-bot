
/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { displayCommandCurl } from "../utils/displayCommandCurl.js";
import { errorHandler } from "../utils/errorHandler.js";
import { sendDebugLog } from "../utils/sendDebugLog.js";
import type { Bot } from "../interfaces/bot.js";

/**
 * To be mounted on the ClientReady gateway event. Sends
 * a message to the debug webhook to confirm the bot has
 * authenticated to Discord.
 * @param bot -- The bot object, containing the webhook client.
 */
export const onReady = async(bot: Bot): Promise<void> => {
  try {
    await sendDebugLog(bot, { content: "Bot has authenticated to Discord." });
    await sendDebugLog(bot, { files: [ {
      attachment: Buffer.from(displayCommandCurl(bot)),
      name:       "curl.sh",
    } ] });
  } catch (error) {
    await errorHandler(bot, "discord on ready event", error);
  }
};
