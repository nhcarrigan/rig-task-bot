
/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { GatewayIntentBits } from "discord.js";
import { describe, it, expect } from "vitest";
import { intents } from "../../src/config/intents.ts";

describe("intents", () => {
  it("should include expected intents", () => {
    expect.assertions(1);
    expect(intents, "missing guilds").
      toContain(GatewayIntentBits.Guilds);
  });
});
