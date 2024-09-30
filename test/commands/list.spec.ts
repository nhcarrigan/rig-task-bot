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
import { list } from "../../src/commands/list.js";
import { errorHandler } from "../../src/utils/errorHandler.js";

vi.mock("../../src/utils/errorHandler.ts", () => {
  return {
    errorHandler: vi.fn(),
  };
});

describe("list command", () => {
  it("should have the correct data", () => {
    expect.assertions(34);
    expect(list.data.name, "did not have the correct name").toBe("list");
    expect(list.data.name.length, "name is too long").toBeLessThanOrEqual(32);
    expect(list.data.name, "name has invalid characters").toMatch(
      /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u,
    );
    expect(list.data.description, "did not have the correct description").toBe(
      "List all tasks, with optional filters.",
    );
    expect(
      list.data.description.length,
      "description is too long",
    ).toBeLessThanOrEqual(100);
    expect(
      list.data.contexts,
      "did not have the correct context",
    ).toStrictEqual([ InteractionContextType.Guild ]);
    expect(list.data.options, "should have 4 options").toHaveLength(4);
    expect(
      list.data.options[0].toJSON().name,
      "did not have the correct option name",
    ).toBe("priority");
    expect(
      list.data.options[0].toJSON().description,
      "did not have the correct option description",
    ).toBe("List tasks under this priority.");
    expect(
      list.data.options[0].toJSON().required,
      "did not have the correct option required value",
    ).toBeFalsy();
    expect(
      list.data.options[0].toJSON().type,
      "did not have the correct option type",
    ).toBe(ApplicationCommandOptionType.String);
    expect(
      list.data.options[0].toJSON().choices,
      "should have 5 choices",
    ).toHaveLength(5);
    expect(
      list.data.options[0].toJSON().choices[0].name,
      "should have the correct name",
    ).toBe("Low");
    expect(
      list.data.options[0].toJSON().choices[0].value,
      "should have the correct value",
    ).toBe("low");
    expect(
      list.data.options[0].toJSON().choices[1].name,
      "should have the correct name",
    ).toBe("Medium");
    expect(
      list.data.options[0].toJSON().choices[1].value,
      "should have the correct value",
    ).toBe("medium");
    expect(
      list.data.options[0].toJSON().choices[2].name,
      "should have the correct name",
    ).toBe("High");
    expect(
      list.data.options[0].toJSON().choices[2].value,
      "should have the correct value",
    ).toBe("high");
    expect(
      list.data.options[0].toJSON().choices[3].name,
      "should have the correct name",
    ).toBe("Critical");
    expect(
      list.data.options[0].toJSON().choices[3].value,
      "should have the correct value",
    ).toBe("critical");
    expect(
      list.data.options[0].toJSON().choices[4].name,
      "should have the correct name",
    ).toBe("None");
    expect(
      list.data.options[0].toJSON().choices[4].value,
      "should have the correct value",
    ).toBe("none");
    expect(
      list.data.options[1].toJSON().name,
      "did not have the correct option name",
    ).toBe("tag");
    expect(
      list.data.options[1].toJSON().description,
      "did not have the correct option description",
    ).toBe("List tasks with this tag.");
    expect(
      list.data.options[1].toJSON().required,
      "did not have the correct option required value",
    ).toBeFalsy();
    expect(
      list.data.options[1].toJSON().type,
      "did not have the correct option type",
    ).toBe(ApplicationCommandOptionType.String);
    expect(
      list.data.options[2].toJSON().name,
      "did not have the correct option name",
    ).toBe("assignee");
    expect(
      list.data.options[2].toJSON().description,
      "did not have the correct option description",
    ).toBe("List tasks assigned to this user.");
    expect(
      list.data.options[2].toJSON().required,
      "did not have the correct option required value",
    ).toBeFalsy();
    expect(
      list.data.options[2].toJSON().type,
      "did not have the correct option type",
    ).toBe(ApplicationCommandOptionType.User);
    expect(
      list.data.options[3].toJSON().name,
      "did not have the correct option name",
    ).toBe("completed");
    expect(
      list.data.options[3].toJSON().description,
      "did not have the correct option description",
    ).toBe("List completed tasks.");
    expect(
      list.data.options[3].toJSON().required,
      "did not have the correct option required value",
    ).toBeFalsy();
    expect(
      list.data.options[3].toJSON().type,
      "did not have the correct option type",
    ).toBe(ApplicationCommandOptionType.Boolean);
  });

  it("should execute correctly with no filters", async() => {
    expect.assertions(3);
    const mockBot = {
      database: {
        tasks: {
          findMany: vi.fn().mockImplementation((data) => {
            return [
              {
                assignees:   [],
                completed:   false,
                deleted:     false,
                description: "Task 1 description",
                dueAt:       new Date("September 4, 2000"),
                numericalId: 1,
                priority:    "none",
                tags:        [],
                title:       "Task 1",
              },
              {
                assignees:   [ "123", "456" ],
                completed:   true,
                deleted:     true,
                description: "Task 2 description",
                dueAt:       new Date(),
                numericalId: 2,
                priority:    "low",
                tags:        [ "tag1", "tag2" ],
                title:       "Task 2",
              },
              {
                assignees:   [ "789" ],
                completed:   false,
                deleted:     false,
                description: "Task 3 description",
                dueAt:       new Date("October 8, 2001"),
                numericalId: 3,
                priority:    "medium",
                tags:        [ "tag1" ],
                title:       "Task 3",
              },
            ].filter((task) => {
              return Object.entries(data.where).every(([ key, value ]) => {
                return task[key] === value;
              });
            });
          }),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    {
        getBoolean: vi.fn().mockReturnValue(null),
        getString:  vi.fn().mockReturnValue(null),
        getUser:    vi.fn().mockReturnValue(null),
      },
    } as never;
    await list.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findMany,
      "should query database",
    ).toHaveBeenCalledWith({
      where: {
        completed: false,
        deleted:   false,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "- Task 1: Task 1\n- Task 3: Task 3",
    });
  });

  it("should execute correctly with no data", async() => {
    expect.assertions(3);
    const mockBot = {
      database: {
        tasks: {
          findMany: vi.fn().mockImplementation(() => {
            return [];
          }),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    {
        getBoolean: vi.fn().mockReturnValue(false),
        getString:  vi.fn().mockReturnValue(null),
        getUser:    vi.fn().mockReturnValue(null),
      },
    } as never;
    await list.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findMany,
      "should query database",
    ).toHaveBeenCalledWith({
      where: {
        completed: false,
        deleted:   false,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "No tasks found with this current filter.",
    });
  });

  it("should execute correctly with filters", async() => {
    expect.assertions(3);
    const mockBot = {
      database: {
        tasks: {
          findMany: vi.fn().mockImplementation((data) => {
            return [
              {
                assignees:   [],
                completed:   false,
                deleted:     false,
                description: "Task 1 description",
                dueAt:       new Date(),
                numericalId: 1,
                priority:    "none",
                tags:        [],
                title:       "Task 1",
              },
              {
                assignees:   [ "123", "456" ],
                completed:   true,
                deleted:     false,
                description: "Task 2 description",
                dueAt:       new Date(),
                numericalId: 2,
                priority:    "low",
                tags:        [ "tag1", "tag2" ],
                title:       "Task 2 title",
              },
              {
                assignees:   [ "789" ],
                completed:   false,
                deleted:     true,
                description: "Task 3 description",
                dueAt:       new Date(),
                numericalId: 3,
                priority:    "medium",
                tags:        [ "tag1" ],
                title:       "Task 3",
              },
            ].filter((task) => {
              return Object.entries(data.where).every(([ key, value ]) => {
                if (typeof value === "object") {
                  return task[key].includes(value.has);
                }
                return task[key] === value;
              });
            });
          }),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    {
        getBoolean: vi.fn().mockReturnValue(true),
        getString:  vi.fn().mockImplementation((name) => {
          return name === "priority"
            ? "low"
            : "tag1";
        }),
        getUser: vi.fn().mockReturnValue({ id: "123" }),
      },
    } as never;
    await list.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findMany,
      "should query database",
    ).toHaveBeenCalledWith({
      where: {
        assignees: { has: "123" },
        completed: true,
        deleted:   false,
        priority:  "low",
        tags:      { has: "tag1" },
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "- Task 2: Task 2 title",
    });
  });

  it("should handle errors correctly", async() => {
    expect.assertions(1);
    await list.run(
      {} as never,
      { editReply: vi.fn(), replied: false, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });

  it("should handle errors with interaction.reply correctly", async() => {
    expect.assertions(1);
    vi.resetAllMocks();
    await list.run(
      {} as never,
      { editReply: vi.fn(), replied: true, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });
});
