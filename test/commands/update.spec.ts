/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import {
  ActionRowBuilder,
  InteractionContextType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { describe, it, expect, vi } from "vitest";
import { update } from "../../src/commands/update.js";
import { errorHandler } from "../../src/utils/errorHandler.js";

vi.mock("discord.js", async() => {
  const actual = await vi.importActual("discord.js");
  return {
    ...actual,
    ActionRowBuilder: vi.fn(() => {
      return {
        addComponents: vi.fn().mockReturnThis(),
      };
    }),
    ModalBuilder: vi.fn(() => {
      return {
        addComponents: vi.fn().mockReturnThis(),
        setCustomId:   vi.fn().mockReturnThis(),
        setTitle:      vi.fn().mockReturnThis(),
      };
    }),
    TextInputBuilder: vi.fn(() => {
      return {
        setCustomId: vi.fn().mockReturnThis(),
        setLabel:    vi.fn().mockReturnThis(),
        setRequired: vi.fn().mockReturnThis(),
        setStyle:    vi.fn().mockReturnThis(),
      };
    }),
    TextInputStyle: { Paragraph: "Paragraph", Short: "Short" },
  };
});
vi.mock("../../src/utils/errorHandler.ts", () => {
  return {
    errorHandler: vi.fn(),
  };
});

describe("update command", () => {
  it("should have the correct data", () => {
    expect.assertions(7);
    expect(update.data.name, "did not have the correct name").toBe("update");
    expect(update.data.name.length, "name is too long").toBeLessThanOrEqual(32);
    expect(update.data.name, "name has invalid characters").toMatch(
      /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u,
    );
    expect(
      update.data.description,
      "did not have the correct description",
    ).toBe("Update a task.");
    expect(
      update.data.description.length,
      "description is too long",
    ).toBeLessThanOrEqual(100);
    expect(
      update.data.contexts,
      "did not have the correct context",
    ).toStrictEqual([ InteractionContextType.Guild ]);
    expect(update.data.options, "should not have options").toHaveLength(0);
  });

  it("should execute correctly", async() => {
    expect.assertions(28);
    const mockBot = {} as never;
    const mockInteraction = {
      showModal: vi.fn(),
    } as never;
    await update.run(mockBot, mockInteraction);
    expect(TextInputBuilder, "should create text inputs").toHaveBeenCalledTimes(
      4,
    );
    const [ taskNumberCall, titleCall, descriptionCall, dueCall ]
      = vi.mocked(TextInputBuilder).mock.results;
    expect(
      taskNumberCall.value.setLabel,
      "should set task number label",
    ).toHaveBeenCalledWith("Task Number");
    expect(
      taskNumberCall.value.setRequired,
      "should set task number required",
    ).toHaveBeenCalledWith(true);
    expect(
      taskNumberCall.value.setStyle,
      "should set task number style",
    ).toHaveBeenCalledWith(TextInputStyle.Short);
    expect(
      taskNumberCall.value.setCustomId,
      "should set task number custom id",
    ).toHaveBeenCalledWith("taskNumber");
    expect(
      titleCall.value.setLabel,
      "should set title label",
    ).toHaveBeenCalledWith("Title");
    expect(
      titleCall.value.setRequired,
      "should not set title required",
    ).toHaveBeenCalledWith(false);
    expect(
      titleCall.value.setStyle,
      "should set title style",
    ).toHaveBeenCalledWith(TextInputStyle.Short);
    expect(
      titleCall.value.setCustomId,
      "should set title custom id",
    ).toHaveBeenCalledWith("title");
    expect(
      descriptionCall.value.setLabel,
      "should set description label",
    ).toHaveBeenCalledWith("Description");
    expect(
      descriptionCall.value.setRequired,
      "should not set description required",
    ).toHaveBeenCalledWith(false);
    expect(
      descriptionCall.value.setStyle,
      "should set description style",
    ).toHaveBeenCalledWith(TextInputStyle.Paragraph);
    expect(
      descriptionCall.value.setCustomId,
      "should set description custom id",
    ).toHaveBeenCalledWith("description");
    expect(dueCall.value.setLabel, "should set due label").toHaveBeenCalledWith(
      "Due Date",
    );
    expect(
      dueCall.value.setRequired,
      "should not set due required",
    ).toHaveBeenCalledWith(false);
    expect(dueCall.value.setStyle, "should set due style").toHaveBeenCalledWith(
      TextInputStyle.Short,
    );
    expect(
      dueCall.value.setCustomId,
      "should set due custom id",
    ).toHaveBeenCalledWith("dueDate");
    expect(ActionRowBuilder, "should create action rows").toHaveBeenCalledTimes(
      4,
    );
    const [ rowZeroCall, rowOneCall, rowTwoCall, rowThreeCall ]
      = vi.mocked(ActionRowBuilder).mock.results;
    expect(
      rowZeroCall.value.addComponents,
      "should add number to row",
    ).toHaveBeenCalledWith(taskNumberCall.value);
    expect(
      rowOneCall.value.addComponents,
      "should add title to row",
    ).toHaveBeenCalledWith(titleCall.value);
    expect(
      rowTwoCall.value.addComponents,
      "should add description to row",
    ).toHaveBeenCalledWith(descriptionCall.value);
    expect(
      rowThreeCall.value.addComponents,
      "should add due to row",
    ).toHaveBeenCalledWith(dueCall.value);
    expect(ModalBuilder, "should update modal").toHaveBeenCalledTimes(1);
    expect(
      vi.mocked(ModalBuilder).mock.results[0].value.setTitle,
      "should set modal title",
    ).toHaveBeenCalledWith("Update Task");
    expect(
      vi.mocked(ModalBuilder).mock.results[0].value.addComponents,
      "should add components to modal",
    ).toHaveBeenCalledTimes(1);

    expect(
      vi.mocked(ModalBuilder).mock.results[0].value.addComponents,
      "should add components to modal",
    ).toHaveBeenCalledWith(
      rowZeroCall.value,
      rowOneCall.value,
      rowTwoCall.value,
      rowThreeCall.value,
    );
    expect(
      vi.mocked(ModalBuilder).mock.results[0].value.setCustomId,
      "should set modal custom id",
    ).toHaveBeenCalledWith("update-task");
    expect(
      mockInteraction.showModal,
      "should display the modal",
    ).toHaveBeenCalledWith(ModalBuilder.mock.results[0].value);
  });

  it("should handle errors correctly", async() => {
    expect.assertions(1);
    await update.run(
      {} as never,
      { editReply: vi.fn(), replied: false, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });

  it("should handle errors with interaction.reply correctly", async() => {
    expect.assertions(1);
    vi.resetAllMocks();
    await update.run(
      {} as never,
      { editReply: vi.fn(), replied: true, reply: vi.fn() } as never,
    );
    expect(errorHandler, "should call error handler").toHaveBeenCalledTimes(1);
  });
});
