/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { PrismaClient } from "@prisma/client";
import { Client, Events, WebhookClient } from "discord.js";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { intents } from "../src/config/intents.js";
import { onInteractionCreate } from "../src/events/onInteractionCreate.js";
import { onReady } from "../src/events/onReady.js";
import { boot } from "../src/index.js";
import { validateEnvironmentVariables }
  from "../src/utils/validateEnvironmentVariables.js";

vi.mock("@prisma/client");
vi.mock("discord.js");
vi.mock("../src/utils/sendDebugLog.js");
vi.mock("../src/utils/validateEnvironmentVariables.js");
vi.mock("../src/events/onReady.ts", () => {
  return {
    onReady: vi.fn(),
  };
});
vi.mock("../src/events/onInteractionCreate.ts", () => {
  return {
    onInteractionCreate: vi.fn(),
  };
});

const mockBot = {
  database: {
    $connect: vi.fn().mockResolvedValue(undefined),
  } as never as PrismaClient,
  discord: {
    login: vi.fn().mockResolvedValue("Logged in"),
    on:    vi.fn(),
  } as never as Client,
  env: {
    discordToken: "mock-token",
    // Add other necessary environment variables
  },
};

describe("boot function", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(Client).mockImplementation(() => {
      return mockBot.discord;
    });
    vi.mocked(PrismaClient).mockImplementation(() => {
      return mockBot.database;
    });
    vi.mocked(validateEnvironmentVariables).mockReturnValue(
      mockBot.env as never,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize the bot and connect to all platforms", async() => {
    expect.assertions(9);
    await boot();

    expect(
      validateEnvironmentVariables,
      "should validate env",
    ).toHaveBeenCalledWith();
    expect(Client, "should construct discord bot").toHaveBeenCalledWith({
      intents,
    });
    expect(PrismaClient, "should construct prisma client").
      toHaveBeenCalledTimes(1);
    expect(
      mockBot.database.$connect,
      "should connect to database",
    ).toHaveBeenCalledTimes(1);
    expect(mockBot.discord.on, "did not mount interaction create").
      toHaveBeenCalledWith(
        Events.InteractionCreate,
        expect.any(Function),
      );
    const interactionCallback = mockBot.discord.on.mock.calls.find((call) => {
      return call[0] === Events.InteractionCreate;
    })?.[1];
    interactionCallback({} as never);
    expect(onInteractionCreate, "should call oninteractioncreate").
      toHaveBeenCalledWith(mockBot, {});
    expect(mockBot.discord.on, "did not mount ready").toHaveBeenCalledWith(
      Events.ClientReady,
      expect.any(Function),
    );

    const readyCallback = mockBot.discord.on.mock.calls.find((call) => {
      return call[0] === Events.ClientReady;
    })?.[1];
    readyCallback();
    expect(onReady, "should call onready").toHaveBeenCalledWith(mockBot);
    expect(
      mockBot.discord.login,
      "should login to Discord",
    ).toHaveBeenCalledWith(mockBot.env.discordToken);
  });

  it("should handle errors and send them to the debug webhook", async() => {
    expect.assertions(1);
    const mockError = new Error("Test error");
    vi.mocked(validateEnvironmentVariables).mockImplementation(() => {
      throw mockError;
    });

    const mockWebhookSend = vi.fn().mockResolvedValue(undefined);
    vi.mocked(WebhookClient).mockImplementation(() => {
      return {
        send: mockWebhookSend,
      } as unknown as WebhookClient;
    });

    process.env.DISCORD_DEBUG_WEBHOOK = "https://mock-webhook-url";

    await boot();

    expect(
      mockWebhookSend,
      "should send directly to webhook",
    ).toHaveBeenCalledWith({
      content: `Error: ${JSON.stringify(mockError, null, 2)}`,
    });
  });
});
