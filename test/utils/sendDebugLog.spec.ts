/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { describe, it, expect, vi } from "vitest";
import { sendDebugLog } from "../../src/utils/sendDebugLog.ts";

const mockBot = {
  discord: {
    user: {
      displayAvatarURL: vi.
        fn().
        mockReturnValue("https://cdn.nhcarrigan.com/nhcarrigan.png"),
      username: "Tasks",
    },
  },
  env: {
    discordDebugWebhook: {
      send: vi.fn(),
    },
  },
};

describe("send debug log", () => {
  it("should send a message to the webhook", () => {
    expect.assertions(2);
    sendDebugLog(mockBot as never, { content: "Test message." });
    expect(
      mockBot.env.discordDebugWebhook.send,
      "should send message",
    ).toHaveBeenCalledTimes(1);
    expect(
      mockBot.env.discordDebugWebhook.send,
      "should send message",
    ).toHaveBeenCalledWith({
      avatarURL: "https://cdn.nhcarrigan.com/nhcarrigan.png",
      content:   "Test message.",
      username:  "Tasks",
    });
  });

  it("should fallback when no user", () => {
    expect.assertions(2);
    // @ts-expect-error - Testing fallback when user is undefined.
    mockBot.discord.user = undefined;
    vi.resetAllMocks();
    sendDebugLog(mockBot as never, { content: "Test message." });
    expect(
      mockBot.env.discordDebugWebhook.send,
      "should send message",
    ).toHaveBeenCalledTimes(1);
    expect(
      mockBot.env.discordDebugWebhook.send,
      "should send message",
    ).toHaveBeenCalledWith({
      avatarURL: "https://cdn.nhcarrigan.com/profile.png",
      content:   "Test message.",
      username:  "RIG Task Bot",
    });
  });
});
