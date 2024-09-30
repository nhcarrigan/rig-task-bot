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
import { deleteCommand } from "../../src/commands/delete.js";
import { errorHandler } from "../../src/utils/errorHandler.js";

vi.mock("../../src/utils/errorHandler.ts", () => {
  return {
    errorHandler: vi.fn(),
  };
});

describe("delete command", () => {
  it("should have the correct data", () => {
    expect.assertions(11);
    expect(deleteCommand.data.name, "did not have the correct name").toBe(
      "delete",
    );
    expect(
      deleteCommand.data.name.length,
      "name is too long",
    ).toBeLessThanOrEqual(32);
    expect(deleteCommand.data.name, "name has invalid characters").toMatch(
      /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u,
    );
    expect(
      deleteCommand.data.description,
      "did not have the correct description",
    ).toBe(
      // eslint-disable-next-line stylistic/max-len
      "Mark a task as deleted. WARNING: This will scrub all PII from the task and CANNOT be undone.",
    );
    expect(
      deleteCommand.data.description.length,
      "description is too long",
    ).toBeLessThanOrEqual(100);
    expect(
      deleteCommand.data.contexts,
      "did not have the correct context",
    ).toStrictEqual([ InteractionContextType.Guild ]);
    expect(deleteCommand.data.options, "should have 1 option").toHaveLength(1);
    expect(
      deleteCommand.data.options[0].toJSON().name,
      "did not have the correct option name",
    ).toBe("id");
    expect(
      deleteCommand.data.options[0].toJSON().description,
      "did not have the correct option description",
    ).toBe("The ID of the task to delete.");
    expect(
      deleteCommand.data.options[0].toJSON().required,
      "did not have the correct option required value",
    ).toBeTruthy();
    expect(
      deleteCommand.data.options[0].toJSON().type,
      "did not have the correct option type",
    ).toBe(ApplicationCommandOptionType.Integer);
  });

  it("should execute correctly", async() => {
    expect.assertions(3);
    const mockBot = {
      database: {
        tasks: {
          update: vi.fn().mockReturnValue({
            catch: vi.fn().mockReturnValue([ { assignees: [ "123" ] } ]),
          }),
        },
      },
    } as never;
    const mockInteraction = {
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      options:    { getInteger: vi.fn().mockReturnValue(1) },
    } as never;
    await deleteCommand.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.update,
      "should update database",
    ).toHaveBeenCalledWith({
      data: {
        assignees:   [],
        deleted:     true,
        description: "This task has been deleted.",
        dueAt:       expect.any(Date),
        priority:    "deleted",
        tags:        [],
        title:       "Deleted Task",
      },
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "Task 1 has been marked as deleted.",
    });
  });

  it("should execute correctly when task not found", async() => {
    expect.assertions(3);
    const mockBot = {
      database: {
        tasks: {
          update: vi.fn().mockReturnValue({
            catch: vi.fn().mockImplementation((callback) => {
              return callback();
            }),
          }),
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
    await deleteCommand.run(mockBot, mockInteraction);
    expect(
      mockInteraction.deferReply,
      "should defer the reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.update,
      "should update database",
    ).toHaveBeenCalledWith({
      data: {
        assignees:   [],
        deleted:     true,
        description: "This task has been deleted.",
        dueAt:       expect.any(Date),
        priority:    "deleted",
        tags:        [],
        title:       "Deleted Task",
      },
      where: {
        numericalId: 1,
      },
    });
    expect(
      mockInteraction.editReply,
      "should call editReply",
    ).toHaveBeenCalledWith({
      content: "Task 1 does not exist.",
    });
  });

  it("should handle errors correctly", async() => {
    expect.assertions(1);
    await deleteCommand.run(
      {} as never,
      { editReply: vi.fn(), replied: false, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });

  it("should handle errors with interaction.reply correctly", async() => {
    expect.assertions(1);
    vi.resetAllMocks();
    await deleteCommand.run(
      {} as never,
      { editReply: vi.fn(), replied: true, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });
});
