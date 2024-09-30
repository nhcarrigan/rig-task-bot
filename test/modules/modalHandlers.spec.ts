/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { describe, it, expect, vi } from "vitest";
import {
  createModal,
  defaultModal,
  updateModal,
} from "../../src/modules/modalHandlers.ts";
import { errorHandler } from "../../src/utils/errorHandler.ts";

describe("default modal", () => {
  it("should send the expected response", async() => {
    expect.assertions(1);
    const mockInteraction = {
      customId: "test",
      reply:    vi.fn(),
    };
    await defaultModal({} as never, mockInteraction as never);
    expect(
      mockInteraction.reply,
      "should reply with correct body",
    ).toHaveBeenCalledWith({
      content:   "Modal test has no handler.",
      ephemeral: true,
    });
  });
});

describe("create modal", () => {
  it("should send the expected response and save to the database", async() => {
    expect.assertions(4);
    const mockInteraction = {
      customId:   "create-modal",
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      fields:     {
        getTextInputValue: vi.fn().mockImplementation((value: string) => {
          return value === "dueDate"
            ? "September 5, 2000"
            : value;
        }),
      },
      reply: vi.fn(),
    };
    const mockBot = {
      database: {
        tasks: {
          count:  vi.fn().mockReturnValue(1),
          create: vi.fn().mockImplementation((data: { data: unknown }) => {
            return data.data;
          }),
        },
      },
    };
    await createModal(mockBot as never, mockInteraction as never);
    expect(
      mockInteraction.deferReply,
      "should defer reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.count,
      "should generate an id",
    ).toHaveBeenCalledOnce();
    expect(
      mockBot.database.tasks.create,
      "should save to the database",
    ).toHaveBeenCalledWith({
      data: {
        description: "description",
        dueAt:       expect.any(Date),
        numericalId: 2,
        title:       "title",
      },
    });
    expect(
      mockInteraction.editReply,
      "should reply with correct body",
    ).toHaveBeenCalledWith({
      content: "Task 2 created.",
    });
  });

  it("should handle the fallback date", async() => {
    expect.assertions(4);
    const mockInteraction = {
      customId:   "create-modal",
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      fields:     {
        getTextInputValue: vi.fn().mockImplementation((value: string) => {
          return value;
        }),
      },
      reply: vi.fn(),
    };
    const mockBot = {
      database: {
        tasks: {
          count:  vi.fn().mockReturnValue(1),
          create: vi.fn().mockImplementation((data: { data: unknown }) => {
            return data.data;
          }),
        },
      },
    };
    await createModal(mockBot as never, mockInteraction as never);
    expect(
      mockInteraction.deferReply,
      "should defer reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.count,
      "should generate an id",
    ).toHaveBeenCalledOnce();
    expect(
      mockBot.database.tasks.create,
      "should save to the database",
    ).toHaveBeenCalledWith({
      data: {
        description: "description",
        dueAt:       expect.any(Date),
        numericalId: 2,
        title:       "title",
      },
    });
    expect(
      mockInteraction.editReply,
      "should reply with correct body",
    ).toHaveBeenCalledWith({
      content: "Task 2 created.",
    });
  });

  it("should call the error handler if an error is thrown", async() => {
    expect.assertions(1);
    const mockInteraction = {
      commandName:        "test",
      inCachedGuild:      vi.fn().mockReturnValue(true),
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
    await createModal({} as never, mockInteraction as never);
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });

  it("should call the error handler if replied and is thrown", async() => {
    expect.assertions(1);
    vi.clearAllMocks();
    const mockInteraction = {
      commandName: "test",
      deferReply:  vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      }),
      editReply: vi.fn(),
      replied:   true,
    };
    const mockBot = {
      env: {
        debugHook: {
          send: vi.fn(),
        },
      },
    };
    vi.mock("../../src/utils/errorHandler.ts", () => {
      return {
        errorHandler: vi.fn(),
      };
    });
    await createModal(mockBot as never, mockInteraction as never);
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });
});

describe("update modal", () => {
  it("should respond when the number input is invalid", async() => {
    expect.assertions(3);
    const mockInteraction = {
      customId:   "create-modal",
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      fields:     {
        getTextInputValue: vi.fn().mockImplementation((value: string) => {
          return value === "dueDate"
            ? "September 5, 2000"
            : value;
        }),
      },
      reply: vi.fn(),
    };
    const mockBot = {
      database: {
        tasks: {
          findFirst: vi.fn().mockReturnValue(null),
        },
      },
    };

    await updateModal(mockBot as never, mockInteraction as never);
    expect(
      mockInteraction.deferReply,
      "should defer reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findFirst,
      "should find the task",
    ).not.toHaveBeenCalledOnce();
    expect(
      mockInteraction.editReply,
      "should reply with correct body",
    ).toHaveBeenCalledWith({
      content: "Invalid task number.",
    });
  });

  it("should respond when the task number is not found", async() => {
    expect.assertions(3);
    const mockInteraction = {
      customId:   "create-modal",
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      fields:     {
        getTextInputValue: vi.fn().mockImplementation((value: string) => {
          // eslint-disable-next-line no-nested-ternary
          return value === "dueDate"
            ? "September 5, 2000"
            : value === "taskNumber"
              ? "1"
              : value;
        }),
      },
      reply: vi.fn(),
    };
    const mockBot = {
      database: {
        tasks: {
          findFirst: vi.fn().mockReturnValue(null),
        },
      },
    };

    await updateModal(mockBot as never, mockInteraction as never);
    expect(
      mockInteraction.deferReply,
      "should defer reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findFirst,
      "should find the task",
    ).toHaveBeenCalledWith({ where: { numericalId: 1 } });
    expect(
      mockInteraction.editReply,
      "should reply with correct body",
    ).toHaveBeenCalledWith({
      content: "Task 1 not found.",
    });
  });

  it("should update the task", async() => {
    expect.assertions(4);
    const mockInteraction = {
      customId:   "create-modal",
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      fields:     {
        getTextInputValue: vi.fn().mockImplementation((value: string) => {
          // eslint-disable-next-line no-nested-ternary
          return value === "dueDate"
            ? "September 5, 2000"
            : value === "taskNumber"
              ? "1"
              : value;
        }),
      },
      reply: vi.fn(),
    };
    const mockBot = {
      database: {
        tasks: {
          findFirst: vi.fn().mockReturnValue({
            description: "Naomi's test description",
            dueAt:       new Date("October 1, 2000"),
            numericalId: 1,
            title:       "Naomi's test task",
          }),
          update: vi.fn(),
        },
      },
    };

    await updateModal(mockBot as never, mockInteraction as never);
    expect(
      mockInteraction.deferReply,
      "should defer reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findFirst,
      "should find the task",
    ).toHaveBeenCalledWith({ where: { numericalId: 1 } });
    expect(
      mockBot.database.tasks.update,
      "should update the task",
    ).toHaveBeenCalledWith({
      data: {
        description: "description",
        dueAt:       new Date("September 5, 2000"),
        title:       "title",
      },
      where: { numericalId: 1 },
    });
    expect(
      mockInteraction.editReply,
      "should reply with correct body",
    ).toHaveBeenCalledWith({
      content: "Task 1 updated.",
    });
  });

  it("should handle invalid dates", async() => {
    expect.assertions(4);
    const mockInteraction = {
      customId:   "create-modal",
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      fields:     {
        getTextInputValue: vi.fn().mockImplementation((value: string) => {
          return value === "taskNumber"
            ? "1"
            : value;
        }),
      },
      reply: vi.fn(),
    };
    const mockBot = {
      database: {
        tasks: {
          findFirst: vi.fn().mockReturnValue({
            description: "Naomi's test description",
            dueAt:       new Date("October 1, 2000"),
            numericalId: 1,
            title:       "Naomi's test task",
          }),
          update: vi.fn(),
        },
      },
    };

    await updateModal(mockBot as never, mockInteraction as never);
    expect(
      mockInteraction.deferReply,
      "should defer reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findFirst,
      "should find the task",
    ).toHaveBeenCalledWith({ where: { numericalId: 1 } });
    expect(
      mockBot.database.tasks.update,
      "should update the task",
    ).toHaveBeenCalledWith({
      data: {
        description: "description",
        dueAt:       expect.any(Date),
        title:       "title",
      },
      where: { numericalId: 1 },
    });
    expect(
      mockInteraction.editReply,
      "should reply with correct body",
    ).toHaveBeenCalledWith({
      content: "Task 1 updated.",
    });
  });

  it("should update the task with all fallback values", async() => {
    expect.assertions(4);
    const mockInteraction = {
      customId:   "create-modal",
      deferReply: vi.fn(),
      editReply:  vi.fn(),
      fields:     {
        getTextInputValue: vi.fn().mockImplementation((value: string) => {
          return value === "taskNumber"
            ? "1"
            : "";
        }),
      },
      reply: vi.fn(),
    };
    const mockBot = {
      database: {
        tasks: {
          findFirst: vi.fn().mockReturnValue({
            description: "Naomi's test description",
            dueAt:       new Date("October 1, 2000"),
            numericalId: 1,
            title:       "Naomi's test task",
          }),
          update: vi.fn(),
        },
      },
    };

    await updateModal(mockBot as never, mockInteraction as never);
    expect(
      mockInteraction.deferReply,
      "should defer reply",
    ).toHaveBeenCalledWith({ ephemeral: true });
    expect(
      mockBot.database.tasks.findFirst,
      "should find the task",
    ).toHaveBeenCalledWith({ where: { numericalId: 1 } });
    expect(
      mockBot.database.tasks.update,
      "should update the task",
    ).toHaveBeenCalledWith({
      data:  {},
      where: { numericalId: 1 },
    });
    expect(
      mockInteraction.editReply,
      "should reply with correct body",
    ).toHaveBeenCalledWith({
      content: "Task 1 updated.",
    });
  });

  it("should call the error handler if an error is thrown", async() => {
    expect.assertions(1);
    vi.clearAllMocks();
    const mockInteraction = {
      commandName: "test",
      deferReply:  vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      }),
      reply: vi.fn(),
    };
    const mockBot = {
      env: {
        debugHook: {
          send: vi.fn(),
        },
      },
    };
    vi.mock("../../src/utils/errorHandler.ts", () => {
      return {
        errorHandler: vi.fn(),
      };
    });
    await updateModal(mockBot as never, mockInteraction as never);
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });

  it("should call the error handler if replied and is thrown", async() => {
    expect.assertions(1);
    vi.clearAllMocks();
    const mockInteraction = {
      commandName: "test",
      deferReply:  vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      }),
      editReply: vi.fn(),
      replied:   true,
    };
    const mockBot = {
      env: {
        debugHook: {
          send: vi.fn(),
        },
      },
    };
    vi.mock("../../src/utils/errorHandler.ts", () => {
      return {
        errorHandler: vi.fn(),
      };
    });
    await updateModal(mockBot as never, mockInteraction as never);
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });
});
