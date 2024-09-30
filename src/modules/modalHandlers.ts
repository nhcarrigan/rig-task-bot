/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { errorHandler } from "../utils/errorHandler.js";
import type { Bot } from "../interfaces/bot.js";
import type { Tasks } from "@prisma/client";
import type { ModalSubmitInteraction } from "discord.js";

type ModalHandler = (bot: Bot, modal: ModalSubmitInteraction)=> Promise<void>;

/**
 * Fallback logic for the modal map. Reports the custom ID
 * to be debugged.
 * @param _bot - The bot object. Unused, but necessary to match the type signature.
 * @param modal - The modal interaction payload from Discord.
 */
const defaultModal: ModalHandler = async(
  _bot,
  modal,
): Promise<void> => {
  await modal.reply({
    content:   `Modal ${modal.customId} has no handler.`,
    ephemeral: true,
  });
};

/**
 * Processes the logic for the modal to create a new
 * task.
 * @param bot - The bot object, which contains the database and Discord client.
 * @param modal - The modal interaction payload from Discord.
 */
const createModal: ModalHandler = async(
  bot,
  modal,
): Promise<void> => {
  try {
    await modal.deferReply({
      ephemeral: true,
    });
    const title = modal.fields.getTextInputValue("title");
    const description = modal.fields.getTextInputValue("description");
    const date = modal.fields.getTextInputValue("dueDate");
    const parsedDate = new Date(date);
    const dueDate = Number.isNaN(parsedDate.valueOf())
      ? new Date()
      : parsedDate;

    const id = await bot.database.tasks.count() + 1;
    const task = await bot.database.tasks.create({
      data: {
        description: description,
        dueAt:       dueDate,
        numericalId: id,
        title:       title,
      },
    });
    await modal.editReply({
      content: `Task ${String(task.numericalId)} created.`,
    });
  } catch (error) {
    await errorHandler(bot, "create modal handler", error, modal.replied
      ? modal.editReply.bind(modal)
      : modal.reply.bind(modal));
  }
};

/**
 * Processes the logic for the modal to update a
 * task.
 * @param bot - The bot object, which contains the database and Discord client.
 * @param modal - The modal interaction payload from Discord.
 */
// eslint-disable-next-line max-statements, max-lines-per-function
const updateModal: ModalHandler = async(
  bot,
  modal,
): Promise<void> => {
  try {
    await modal.deferReply({
      ephemeral: true,
    });
    const taskNumber = modal.fields.getTextInputValue("taskNumber");
    const number = Number(taskNumber);
    if (Number.isNaN(number)) {
      await modal.editReply({
        content: "Invalid task number.",
      });
      return;
    }
    const task = await bot.database.tasks.findFirst({
      where: {
        numericalId: number,
      },
    });
    if (!task) {
      await modal.editReply({
        content: `Task ${taskNumber} not found.`,
      });
      return;
    }
    const title = modal.fields.getTextInputValue("title");
    const description = modal.fields.getTextInputValue("description");
    const date = modal.fields.getTextInputValue("dueDate");

    const updateObject: Partial<Tasks> = {};
    if (title !== "") {
      updateObject.title = title;
    }
    if (description !== "") {
      updateObject.description = description;
    }
    if (date !== "") {
      const parsedDate = new Date(date);
      const dueDate = Number.isNaN(parsedDate.valueOf())
        ? task.dueAt
        : parsedDate;
      updateObject.dueAt = dueDate;
    }
    await bot.database.tasks.update({
      data:  updateObject,
      where: {
        numericalId: number,
      },
    });
    await modal.editReply({
      content: `Task ${String(task.numericalId)} updated.`,
    });
  } catch (error) {
    await errorHandler(bot, "update modal handler", error, modal.replied
      ? modal.editReply.bind(modal)
      : modal.reply.bind(modal));
  }
};

export { type ModalHandler, createModal, defaultModal, updateModal };
