/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import type { PrismaClient } from "@prisma/client";
import type { Client, WebhookClient } from "discord.js";

export interface Bot {
  env: {
    discordToken:        string;
    discordDebugWebhook: WebhookClient;
    mongoUri:            string;
  };
  discord:  Client;
  database: PrismaClient;
}
