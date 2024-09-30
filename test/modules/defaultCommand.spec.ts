/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { describe, it, expect, vi } from "vitest";
import { defaultCommand } from "../../src/modules/defaultCommand.js";

describe("defaultCommand", () => {
  it("should respond with expected values", async() => {
    expect.assertions(1);
    const mockInteraction = {
      commandName: "test",
      reply:       vi.fn(),
    };
    await defaultCommand({} as never, mockInteraction as never);
    expect(mockInteraction.reply, "should reply with correct body").
      toHaveBeenCalledWith({
        content:   "Interaction test not found.",
        ephemeral: true,
      });
  });
});
