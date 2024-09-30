
/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { validateEnvironmentVariables }
  from "../../src/utils/validateEnvironmentVariables.js";

describe("validate environment variables", () => {
  beforeAll(() => {
    delete process.env.DISCORD_TOKEN;
    delete process.env.DISCORD_DEBUG_WEBHOOK;
  });
  afterAll(() => {
    delete process.env.DISCORD_TOKEN;
    delete process.env.DISCORD_DEBUG_WEBHOOK;
  });

  it("should throw when DISCORD_TOKEN is not set", () => {
    expect.assertions(1);
    expect(() => {
      validateEnvironmentVariables();
    },
    "did not throw on missing DISCORD_TOKEN").
      toThrow(new ReferenceError("DISCORD_TOKEN cannot be undefined."));
  });

  it("should throw when DISCORD_DEBUG_WEBHOOK is not set", () => {
    expect.assertions(1);
    process.env.DISCORD_TOKEN = "test";
    expect(() => {
      validateEnvironmentVariables();
    }
    , "did not throw on missing DISCORD_DEBUG_WEBHOOK").
      toThrow(new ReferenceError("DISCORD_DEBUG_WEBHOOK cannot be undefined."));
  });

  it("should throw when MONGO_URI is not set", () => {
    expect.assertions(1);
    process.env.DISCORD_DEBUG_WEBHOOK
     // eslint-disable-next-line stylistic/max-len
     = "https://discord.com/api/webhooks/11111111111111111/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    expect(() => {
      validateEnvironmentVariables();
    },
    "did not throw on missing MONGO_URI").
      toThrow(new ReferenceError("MONGO_URI cannot be undefined."));
  });

  it("should return the expected environment variables", () => {
    expect.assertions(2);
    process.env.MONGO_URI = "test";
    const result = validateEnvironmentVariables();
    expect(result.discordToken, "did not return correct token").toBe("test");
    expect(result.discordDebugWebhook.url,
      "did not correctly instantiate debug hook").
      // eslint-disable-next-line stylistic/max-len
      toBe("https://discord.com/api/webhooks/11111111111111111/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  });
});
