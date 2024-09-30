/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { onInteractionCreate } from "../../src/events/onInteractionCreate.js";
import { errorHandler } from "../../src/utils/errorHandler.js";

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

describe("onInteractionCreate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should respond with the correct message when command not in guild",
    async() => {
      expect.assertions(1);
      const mockInteraction = {
        commandName:        "test",
        inCachedGuild:      vi.fn().mockReturnValue(false),
        isChatInputCommand: vi.fn().mockReturnValue(true),
        reply:              vi.fn(),
      };
      await onInteractionCreate(mockBot as never, mockInteraction as never);
      expect(mockInteraction.reply, "should reply with correct body").
        toHaveBeenCalledWith({
          content:   "How did you run this out of a guild?",
          ephemeral: true,
        });
    });

  it("should handle chat input commands", async() => {
    expect.assertions(1);
    const mockInteraction = {
      commandName:        "test",
      inCachedGuild:      vi.fn().mockReturnValue(true),
      isChatInputCommand: vi.fn().mockReturnValue(true),
      reply:              vi.fn(),
    };
    await onInteractionCreate(mockBot as never, mockInteraction as never);
    expect(mockInteraction.reply, "should reply with correct body").
      toHaveBeenCalledWith({
        content:   "Interaction test not found.",
        ephemeral: true,
      });
  });

  it("should respond with the correct message when modal not in guild",
    async() => {
      expect.assertions(1);
      const mockInteraction = {
        customId:           "test",
        inCachedGuild:      vi.fn().mockReturnValue(false),
        isChatInputCommand: vi.fn().mockReturnValue(false),
        isModalSubmit:      vi.fn().mockReturnValue(true),
        reply:              vi.fn(),
      };
      await onInteractionCreate(mockBot as never, mockInteraction as never);
      expect(mockInteraction.reply, "should reply with correct body").
        toHaveBeenCalledWith({
          content:   "How did you get a modal outside of a guild?",
          ephemeral: true,
        });
    });

  it("should handle modal submit interactions", async() => {
    expect.assertions(1);
    const mockInteraction = {
      customId:           "test",
      inCachedGuild:      vi.fn().mockReturnValue(true),
      isChatInputCommand: vi.fn().mockReturnValue(false),
      isModalSubmit:      vi.fn().mockReturnValue(true),
      reply:              vi.fn(),
    };
    await onInteractionCreate(mockBot as never, mockInteraction as never);
    expect(mockInteraction.reply, "should reply with correct body").
      toHaveBeenCalledWith({
        content:   `Modal test has no handler.`,
        ephemeral: true,
      });
  });

  it("should throw an error if the interaction type is unknown", async() => {
    expect.assertions(1);
    const mockInteraction = {
      customId:           "test",
      inCachedGuild:      vi.fn().mockReturnValue(true),
      isAutocomplete:     vi.fn().mockReturnValue(false),
      isChatInputCommand: vi.fn().mockReturnValue(false),
      isModalSubmit:      vi.fn().mockReturnValue(false),
      reply:              vi.fn(),
    };
    await onInteractionCreate(mockBot as never, mockInteraction as never);
    expect(errorHandler, "should call error handler").
      toHaveBeenCalledTimes(1);
  });

  it("should call the error handler if an error is thrown", async() => {
    expect.assertions(1);
    const mockInteraction = {
      commandName:        "test",
      editReply:          vi.fn(),
      inCachedGuild:      vi.fn().mockReturnValue(true),
      isAutocomplete:     vi.fn().mockReturnValue(false),
      isChatInputCommand: vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      }),
      replied: true,
      reply:   vi.fn(),
    };
    vi.mock("../../src/utils/errorHandler.ts", () => {
      return {
        errorHandler: vi.fn(),
      };
    });
    await onInteractionCreate(mockBot as never, mockInteraction as never);
    expect(errorHandler, "should call error handler").
      toHaveBeenCalledTimes(1);
  });

  it("should call the error handler if autocomplete is thrown", async() => {
    expect.assertions(1);
    const mockInteraction = {
      commandName:        "test",
      inCachedGuild:      vi.fn().mockReturnValue(true),
      isAutocomplete:     vi.fn().mockReturnValue(true),
      isChatInputCommand: vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      }),
      reply: vi.fn(),
    };
    vi.mock("../../src/utils/errorHandler.ts", () => {
      return {
        errorHandler: vi.fn(),
      };
    });
    await onInteractionCreate(mockBot as never, mockInteraction as never);
    expect(errorHandler, "should call error handler").
      toHaveBeenCalledTimes(1);
  });
});
