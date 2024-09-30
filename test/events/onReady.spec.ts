/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { onReady } from "../../src/events/onReady.js";
import { displayCommandCurl } from "../../src/utils/displayCommandCurl.js";
import { errorHandler } from "../../src/utils/errorHandler.js";
import { sendDebugLog } from "../../src/utils/sendDebugLog.js";

vi.mock("../../src/utils/sendDebugLog.ts", () => {
  return {
    sendDebugLog: vi.fn(),
  };
});

const mockBot = {
  discord: {
    user: {
      id: "123",
    },
  },
  env: {
    discordDebugWebhook: {
      send: vi.fn(),
    },
  },
};

describe("onReady", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call sendDebugLog with the correct messages", async() => {
    expect.assertions(4);
    vi.mock("../../src/utils/errorHandler.ts", () => {
      return {
        errorHandler: vi.fn(),
      };
    });
    await onReady(mockBot as never);

    expect(errorHandler, "should call error handler").not.toHaveBeenCalled();

    expect(sendDebugLog, "should send debug message").toHaveBeenCalledTimes(2);
    expect(sendDebugLog, "should send debug message").toHaveBeenCalledWith(
      mockBot,
      {
        content: "Bot has authenticated to Discord.",
      },
    );
    expect(sendDebugLog, "should send CURL string").toHaveBeenCalledWith(
      mockBot,
      {
        files: [
          {
            attachment: Buffer.from(displayCommandCurl(mockBot as never)),
            name:       "curl.sh",
          },
        ],
      },
    );
  });

  it("should not throw an error", async() => {
    expect.assertions(1);
    await expect(
      onReady(mockBot as never),
      "should not error",
    ).resolves.not.toThrow();
  });

  it("should call the error handler if an error is thrown", async() => {
    expect.assertions(1);
    vi.mock("../../src/utils/errorHandler.ts", () => {
      return {
        errorHandler: vi.fn(),
      };
    });

    vi.mock("../../src/utils/sendDebugLog.ts", () => {
      return {
        sendDebugLog: vi.fn().mockRejectedValue(new Error("Test error")),
      };
    });

    await onReady({} as never);

    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
    vi.mock("../../src/utils/sendDebugLog.ts", () => {
      return {
        sendDebugLog: vi.fn(),
      };
    });
  });
});
