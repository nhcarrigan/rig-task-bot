/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import {
  ApplicationCommandOptionType,
  InteractionContextType,
} from "discord.js";
import { describe, it, expect, vi } from "vitest";
import { priority } from "../../src/commands/priority.js";
import { errorHandler } from "../../src/utils/errorHandler.js";

vi.mock("../../src/utils/errorHandler.ts", () => {
  return {
    errorHandler: vi.fn(),
  };
});

describe("priority command", () => {
  it("should have the correct data", () => {
    expect.assertions(27);
    expect(priority.data.name, "did not have the correct name").toBe(
      "priority",
    );
    expect(priority.data.name.length, "name is too long").toBeLessThanOrEqual(
      32,
    );
    expect(priority.data.name, "name has invalid characters").toMatch(
      /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u,
    );
    expect(
      priority.data.description,
      "did not have the correct description",
    ).toBe("Set the priority of a task.");
    expect(
      priority.data.description.length,
      "description is too long",
    ).toBeLessThanOrEqual(100);
    expect(
      priority.data.contexts,
      "did not have the correct context",
    ).toStrictEqual([ InteractionContextType.Guild ]);
    expect(priority.data.options, "should have 2 options").toHaveLength(2);
    expect(
      priority.data.options[0].toJSON().name,
      "should have the correct name",
    ).toBe("task");
    expect(
      priority.data.options[0].toJSON().description,
      "should have the correct description",
    ).toBe("The task number.");
    expect(
      priority.data.options[0].toJSON().required,
      "should be required",
    ).toBeTruthy();
    expect(
      priority.data.options[0].toJSON()["min_value"],
      "should have a min value of 1",
    ).toBe(1);
    expect(
      priority.data.options[0].toJSON().type,
      "should be a number option",
    ).toBe(ApplicationCommandOptionType.Integer);

    expect(
      priority.data.options[1].toJSON().name,
      "should have the correct name",
    ).toBe("priority");
    expect(
      priority.data.options[1].toJSON().description,
      "should have the correct description",
    ).toBe("The priority level.");
    expect(
      priority.data.options[1].toJSON().required,
      "should be required",
    ).toBeTruthy();
    expect(
      priority.data.options[1].toJSON().choices,
      "should have choices",
    ).toHaveLength(5);
    expect(
      priority.data.options[1].toJSON().choices[0].name,
      "should have the correct name",
    ).toBe("Low");
    expect(
      priority.data.options[1].toJSON().choices[0].value,
      "should have the correct value",
    ).toBe("low");
    expect(
      priority.data.options[1].toJSON().choices[1].name,
      "should have the correct name",
    ).toBe("Medium");
    expect(
      priority.data.options[1].toJSON().choices[1].value,
      "should have the correct value",
    ).toBe("medium");
    expect(
      priority.data.options[1].toJSON().choices[2].name,
      "should have the correct name",
    ).toBe("High");
    expect(
      priority.data.options[1].toJSON().choices[2].value,
      "should have the correct value",
    ).toBe("high");
    expect(
      priority.data.options[1].toJSON().choices[3].name,
      "should have the correct name",
    ).toBe("Critical");
    expect(
      priority.data.options[1].toJSON().choices[3].value,
      "should have the correct value",
    ).toBe("critical");
    expect(
      priority.data.options[1].toJSON().choices[4].name,
      "should have the correct name",
    ).toBe("None");
    expect(
      priority.data.options[1].toJSON().choices[4].value,
      "should have the correct value",
    ).toBe("none");
    expect(
      priority.data.options[1].toJSON().type,
      "should be a string option",
    ).toBe(ApplicationCommandOptionType.String);
  });

  it("should execute correctly", async() => {
    expect.assertions(4);
    const mockBot = {
      database: {
        tasks: {
          findFirst: vi.fn().mockResolvedValue({
            numericalId: 1,
          }),
          update: vi.fn().mockResolvedValue({}),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    {
        getInteger: vi.fn().mockReturnValue(1),
        getString:  vi.fn().mockReturnValue("low"),
      },
    } as never;
    await priority.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findFirst,
      "should call findFirst",
    ).toHaveBeenCalledWith({
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockBot.database.tasks.update,
      "should call update",
    ).toHaveBeenCalledWith({
      data: {
        priority: "low",
      },
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "Task 1 priority set to low.",
    });
  });

  it("should execute correctly when task not found", async() => {
    expect.assertions(4);
    vi.resetAllMocks();
    const mockBot = {
      database: {
        tasks: {
          findFirst: vi.fn().mockResolvedValue(null),
          update:    vi.fn().mockResolvedValue({}),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    {
        getInteger: vi.fn().mockReturnValue(1),
        getString:  vi.fn().mockReturnValue("low"),
      },
    } as never;
    await priority.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findFirst,
      "should call findFirst",
    ).toHaveBeenCalledWith({
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockBot.database.tasks.update,
      "should not call update",
    ).not.toHaveBeenCalled();
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "Task 1 not found.",
    });
  });

  it("should handle errors correctly", async() => {
    expect.assertions(1);
    await priority.run(
      {} as never,
      { editReply: vi.fn(), replied: false, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });

  it("should handle errors with interaction.reply correctly", async() => {
    expect.assertions(1);
    vi.resetAllMocks();
    await priority.run(
      {} as never,
      { editReply: vi.fn(), replied: true, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });
});
