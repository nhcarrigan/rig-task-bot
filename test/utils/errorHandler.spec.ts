/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { EmbedBuilder } from "discord.js";
import { describe, it, expect, vi } from "vitest";
import { errorHandler } from "../../src/utils/errorHandler.ts";
import { sendDebugLog } from "../../src/utils/sendDebugLog.ts";

vi.mock("../../src/utils/sendDebugLog.ts", () => {
  return {
    sendDebugLog: vi.fn(),
  };
});

const mockBot = {
  env: {
    discordDebugWebhook: {
      send: vi.fn(),
    },
  },
};

describe("errorHandler", () => {
  it("should call sendDebugLog", async() => {
    expect.assertions(1);
    await errorHandler(mockBot as never, "test", new Error("Test error"));
    expect(sendDebugLog, "should send debug log").toHaveBeenCalledTimes(1);
  });

  it("should properly format the embed", async() => {
    expect.assertions(1);
    const error = new Error("Test error");
    const id = await errorHandler(mockBot as never, "test", error);
    expect(sendDebugLog, "should send debug log").toHaveBeenCalledWith(
      mockBot,
      {
        embeds: [
          new EmbedBuilder({
            description: error.message,
            fields:      [
              {
                name:  "Stack",
                value: `\`\`\`\n${String(error.stack).slice(0, 1000)}`,
              },
            ],
            footer: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              icon_url: undefined,
              text:     `Error ID: ${id}`,
            },
            title: "Error: test",
          }),
        ],
      },
    );
  });

  it("should handle non-error objects", async() => {
    expect.assertions(1);
    const id = await errorHandler(mockBot as never, "test", "Test error");
    expect(sendDebugLog, "should send debug log").toHaveBeenCalledWith(
      mockBot,
      {
        embeds: [
          new EmbedBuilder({
            description: "Test error",
            footer:      {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              icon_url: undefined,
              text:     `Error ID: ${id}`,
            },
            title: "Error: test",
          }),
        ],
      },
    );
  });

  it("should call the reply function if provided", async() => {
    expect.assertions(1);
    const replyFunction = vi.fn().mockName("reply");
    const id = await errorHandler(
      mockBot as never,
      "test",
      new Error("Test error"),
      replyFunction,
    );
    expect(replyFunction, "should send error ID to user").toHaveBeenCalledWith({
      content:   `Oops! Something went wrong! Please reach out to us in our [support server](https://chat.nhcarrigan.com) and bring this error ID: ${id}`,
      ephemeral: true,
    });
  });
});
