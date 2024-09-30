/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { PrismaClient } from "@prisma/client";
import { Client, Events, WebhookClient } from "discord.js";
import { intents } from "./config/intents.js";
import { onInteractionCreate } from "./events/onInteractionCreate.js";
import { onReady } from "./events/onReady.js";
import { validateEnvironmentVariables }
  from "./utils/validateEnvironmentVariables.js";

/**
 * The entry point file. Handles starting up the application
 * process and mounting the necessary event listeners.
 */
const boot = async(): Promise<void> => {
  try {
    const bot = {
      database: new PrismaClient(),
      discord:  new Client({ intents }),
      env:      validateEnvironmentVariables(),
    };

    await bot.database.$connect();

    bot.discord.on(Events.ClientReady, () => {
      void onReady(bot);
    });

    bot.discord.on(Events.InteractionCreate, (interaction) => {
      void onInteractionCreate(bot, interaction);
    });

    await bot.discord.login(bot.env.discordToken);
  } catch (error) {
    const hook = new WebhookClient({
      url: process.env.DISCORD_DEBUG_WEBHOOK ?? "",
    });
    await hook.send({
      content: `Error: ${JSON.stringify(error, null, 2)}`,
    });
  }
};

void boot();

export { boot };
