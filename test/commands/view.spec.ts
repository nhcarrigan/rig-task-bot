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
import { view } from "../../src/commands/view.js";
import { errorHandler } from "../../src/utils/errorHandler.js";

vi.mock("../../src/utils/errorHandler.ts", () => {
  return {
    errorHandler: vi.fn(),
  };
});

describe("view command", () => {
  it("should have the correct data", () => {
    expect.assertions(11);
    expect(view.data.name, "did not have the correct name").toBe("view");
    expect(view.data.name.length, "name is too long").toBeLessThanOrEqual(32);
    expect(view.data.name, "name has invalid characters").toMatch(
      /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u,
    );
    expect(view.data.description, "did not have the correct description").toBe(
      "View a task by its ID.",
    );
    expect(
      view.data.description.length,
      "description is too long",
    ).toBeLessThanOrEqual(100);
    expect(
      view.data.contexts,
      "did not have the correct context",
    ).toStrictEqual([ InteractionContextType.Guild ]);
    expect(view.data.options, "should have 1 option").toHaveLength(1);
    expect(
      view.data.options[0].toJSON().name,
      "did not have the correct option name",
    ).toBe("id");
    expect(
      view.data.options[0].toJSON().description,
      "did not have the correct option description",
    ).toBe("The ID of the task to view.");
    expect(
      view.data.options[0].toJSON().required,
      "did not have the correct option required value",
    ).toBeTruthy();
    expect(
      view.data.options[0].toJSON().type,
      "did not have the correct option type",
    ).toBe(ApplicationCommandOptionType.Integer);
  });

  it("should execute correctly", async() => {
    expect.assertions(3);
    const mockBot = {
      database: {
        tasks: {
          findUnique: vi.fn().mockReturnValue({
            assignees:   [ "123" ],
            completed:   false,
            deleted:     false,
            description: "Task 1 description",
            dueAt:       new Date("2021-10-10"),
            numericalId: 1,
            priority:    "critical",
            tags:        [ "discord" ],
            title:       "Task 1",
          }),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    { getInteger: vi.fn().mockReturnValue(1) },
    } as never;
    await view.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findUnique,
      "should query database",
    ).toHaveBeenCalledWith({
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      embeds: [
        {
          description: "Task 1 description",
          fields:      [
            { inline: true, name: "Priority", value: "critical" },
            { inline: true, name: "Completed", value: "No" },
            {
              inline: true,
              name:   "Due Date",
              value:  new Date("2021-10-10").toLocaleDateString("en-US"),
            },
            { name: "Tag", value: "discord" },
            { name: "Assignee", value: "<@123>" },
          ],
          title: "Task 1",
        },
      ],
    });
  });

  it("should execute correctly with fallback values", async() => {
    expect.assertions(3);
    const mockBot = {
      database: {
        tasks: {
          findUnique: vi.fn().mockReturnValue({
            assignees:   [ ],
            completed:   false,
            deleted:     false,
            description: "Task 1 description",
            dueAt:       new Date("2021-10-10"),
            numericalId: 1,
            priority:    "critical",
            tags:        [ ],
            title:       "Task 1",
          }),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    { getInteger: vi.fn().mockReturnValue(1) },
    } as never;
    await view.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findUnique,
      "should query database",
    ).toHaveBeenCalledWith({
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      embeds: [
        {
          description: "Task 1 description",
          fields:      [
            { inline: true, name: "Priority", value: "critical" },
            { inline: true, name: "Completed", value: "No" },
            {
              inline: true,
              name:   "Due Date",
              value:  new Date("2021-10-10").toLocaleDateString("en-US"),
            },
            { name: "Tag", value: "No tags." },
            { name: "Assignee", value: "No assignees." },
          ],
          title: "Task 1",
        },
      ],
    });
  });

  it("should execute correctly with a completed task", async() => {
    expect.assertions(3);
    const mockBot = {
      database: {
        tasks: {
          findUnique: vi.fn().mockReturnValue({
            assignees:   [ "123" ],
            completed:   true,
            deleted:     false,
            description: "Task 1 description",
            dueAt:       new Date("2021-10-10"),
            numericalId: 1,
            priority:    "critical",
            tags:        [ "discord" ],
            title:       "Task 1",
          }),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    { getInteger: vi.fn().mockReturnValue(1) },
    } as never;
    await view.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findUnique,
      "should query database",
    ).toHaveBeenCalledWith({
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      embeds: [
        {
          description: "Task 1 description",
          fields:      [
            { inline: true, name: "Priority", value: "critical" },
            { inline: true, name: "Completed", value: "Yes" },
            {
              inline: true,
              name:   "Due Date",
              value:  new Date("2021-10-10").toLocaleDateString("en-US"),
            },
            { name: "Tag", value: "discord" },
            { name: "Assignee", value: "<@123>" },
          ],
          title: "Task 1",
        },
      ],
    });
  });

  it("should execute correctly with a deleted task", async() => {
    expect.assertions(3);
    const mockBot = {
      database: {
        tasks: {
          findUnique: vi.fn().mockReturnValue({
            assignees:   [ "123" ],
            completed:   false,
            deleted:     true,
            description: "Task 1 description",
            dueAt:       new Date("2021-10-10"),
            numericalId: 1,
            priority:    "critical",
            tags:        [ "discord" ],
            title:       "Task 1",
          }),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    { getInteger: vi.fn().mockReturnValue(1) },
    } as never;
    await view.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findUnique,
      "should query database",
    ).toHaveBeenCalledWith({
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "Task 1 has been deleted.",
    });
  });

  it("should execute correctly when task not found", async() => {
    expect.assertions(3);
    const mockBot = {
      database: {
        tasks: {
          findUnique: vi.fn().mockReturnValue(null),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    {
        getInteger: vi.fn().mockReturnValue(1),
      },
    } as never;
    await view.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findUnique,
      "should query database",
    ).toHaveBeenCalledWith({
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "Task 1 not found.",
    });
  });

  it("should handle errors correctly", async() => {
    expect.assertions(1);
    await view.run(
      {} as never,
      { editReply: vi.fn(), replied: false, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });

  it("should handle errors with interaction.reply correctly", async() => {
    expect.assertions(1);
    vi.resetAllMocks();
    await view.run(
      {} as never,
      { editReply: vi.fn(), replied: true, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });
});
