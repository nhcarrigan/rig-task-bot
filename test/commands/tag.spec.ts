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
import { tag } from "../../src/commands/tag.js";
import { errorHandler } from "../../src/utils/errorHandler.js";

vi.mock("../../src/utils/errorHandler.ts", () => {
  return {
    errorHandler: vi.fn(),
  };
});

describe("tag command", () => {
  it("should have the correct data", () => {
    expect.assertions(17);
    expect(tag.data.name, "did not have the correct name").toBe("tag");
    expect(tag.data.name.length, "name is too long").toBeLessThanOrEqual(32);
    expect(tag.data.name, "name has invalid characters").toMatch(
      /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u,
    );
    expect(tag.data.description, "did not have the correct description").toBe(
      "Add or remove a tag from a task.",
    );
    expect(
      tag.data.description.length,
      "description is too long",
    ).toBeLessThanOrEqual(100);
    expect(tag.data.contexts, "did not have the correct context").toStrictEqual(
      [ InteractionContextType.Guild ],
    );
    expect(tag.data.options, "should have 2 options").toHaveLength(2);
    expect(
      tag.data.options[0].toJSON().name,
      "should have the correct name",
    ).toBe("task");
    expect(
      tag.data.options[0].toJSON().description,
      "should have the correct description",
    ).toBe("The task number.");
    expect(
      tag.data.options[0].toJSON().required,
      "should be required",
    ).toBeTruthy();
    expect(
      tag.data.options[0].toJSON()["min_value"],
      "should have a min value of 1",
    ).toBe(1);
    expect(tag.data.options[0].toJSON().type, "should be a number option").toBe(
      ApplicationCommandOptionType.Integer,
    );

    expect(
      tag.data.options[1].toJSON().name,
      "should have the correct name",
    ).toBe("tag");
    expect(
      tag.data.options[1].toJSON().description,
      "should have the correct description",
    ).toBe("The tag.");
    expect(
      tag.data.options[1].toJSON().required,
      "should be required",
    ).toBeTruthy();
    expect(
      tag.data.options[1].toJSON().choices,
      "should not have choices",
    ).toBeUndefined();
    expect(tag.data.options[1].toJSON().type, "should be a string option").toBe(
      ApplicationCommandOptionType.String,
    );
  });

  it("should execute correctly when adding tag", async() => {
    expect.assertions(4);
    const mockBot = {
      database: {
        tasks: {
          findFirst: vi.fn().mockResolvedValue({
            numericalId: 1,
            tags:        [],
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
        getString:  vi.fn().mockReturnValue("discord"),
      },
    } as never;
    await tag.run(mockBot, mockInteraction);
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
        tags: {
          push: "discord",
        },
      },
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "Tag discord added to task 1.",
    });
  });

  it("should execute correctly when removing tag", async() => {
    expect.assertions(4);
    const mockBot = {
      database: {
        tasks: {
          findFirst: vi.fn().mockResolvedValue({
            numericalId: 1,
            tags:        [ "discord", "website" ],
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
        getString:  vi.fn().mockReturnValue("discord"),
      },
    } as never;
    await tag.run(mockBot, mockInteraction);
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
        tags: [ "website" ],
      },
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "Tag discord removed from task 1.",
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
    await tag.run(mockBot, mockInteraction);
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
    await tag.run(
      {} as never,
      { editReply: vi.fn(), replied: false, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });

  it("should handle errors with interaction.reply correctly", async() => {
    expect.assertions(1);
    vi.resetAllMocks();
    await tag.run(
      {} as never,
      { editReply: vi.fn(), replied: true, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });
});
