import { Types } from "mongoose";
import { BoardModel } from "../models/board.js";
import { CardModel } from "../models/card.js";
import { ColumnModel } from "../models/column.js";
import type { AuthUser } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { can, getBoardRole } from "../config/board-permissions.js";
import type { CreateCardInput, UpdateCardInput } from "../schemas/card.js";

async function getBoardRoleForUser(boardId: string, user: AuthUser) {
  if (!Types.ObjectId.isValid(boardId)) {
    throw new AppError(400, "boardId invalid");
  }
  const board = await BoardModel.findById(boardId).select("ownerId members");
  if (!board) {
    throw new AppError(404, "Board not found");
  }
  const role = getBoardRole(board, user.id);
  if (!role) {
    throw new AppError(403, "Forbidden");
  }
  return role;
}

function validateCardId(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "id invalid");
  }
}

export const CardService = {
  getCards: async (
    boardId: string,
    columnId: string | undefined,
    user: AuthUser,
  ) => {
    const role = await getBoardRoleForUser(boardId, user);
    if (!can(role, "board:read")) throw new AppError(403, "Forbidden");
    if (columnId) {
      const column = await ColumnModel.findOne({
        _id: columnId,
        boardId,
      }).select("_id");
      if (!column) throw new AppError(404, "Column not found");
    }
    return CardModel.find({ boardId, ...(columnId ? { columnId } : {}) })
      .sort({ columnId: 1, position: 1, createdAt: 1 })
      .lean();
  },
  getCard: async (boardId: string, id: string, user: AuthUser) => {
    const role = await getBoardRoleForUser(boardId, user);
    if (!can(role, "board:read")) throw new AppError(403, "Forbidden");
    validateCardId(id);
    const card = await CardModel.findOne({ _id: id, boardId }).lean();
    if (!card) throw new AppError(404, "Card not found");
    return card;
  },
  createCard: async (
    boardId: string,
    input: CreateCardInput,
    user: AuthUser,
  ) => {
    const role = await getBoardRoleForUser(boardId, user);
    if (!can(role, "card:write")) {
      throw new AppError(403, "Forbidden");
    }
    const column = await ColumnModel.findOne({ _id: input.columnId, boardId });
    if (!column) {
      throw new AppError(404, "Column not found");
    }
    const position = await CardModel.countDocuments({
      boardId,
      columnId: input.columnId,
    });
    return CardModel.create({
      ...input,
      description: input.description ?? "",
      boardId,
      createdBy: user.id,
      position,
    });
  },
  updateCard: async (
    boardId: string,
    id: string,
    input: UpdateCardInput,
    user: AuthUser,
  ) => {
    const role = await getBoardRoleForUser(boardId, user);
    if (!can(role, "card:write")) throw new AppError(403, "Forbidden");
    validateCardId(id);
    const card = await CardModel.findOne({ _id: id, boardId });
    if (!card) throw new AppError(404, "Card not found");
    if (input.columnId && input.columnId !== card.columnId.toString()) {
      const destination = await ColumnModel.findOne({
        _id: input.columnId,
        boardId,
      });
      if (!destination) throw new AppError(404, "Column not found");
      const destinationCount = await CardModel.countDocuments({
        boardId,
        columnId: input.columnId,
      });
      card.position = input.position ?? destinationCount;
      card.columnId = new Types.ObjectId(input.columnId);
    } else if (input.position !== undefined) {
      card.position = input.position;
    }
    if (input.title !== undefined) card.title = input.title;
    if (input.description !== undefined) card.description = input.description;
    await card.save();
    return card;
  },
  deleteCard: async (
    boardId: string,
    id: string,
    user: AuthUser,
  ): Promise<void> => {
    const role = await getBoardRoleForUser(boardId, user);
    if (!can(role, "card:write")) throw new AppError(403, "Forbidden");
    validateCardId(id);
    const card = await CardModel.findOneAndDelete({ _id: id, boardId });
    if (!card) throw new AppError(404, "Card not found");
    await CardModel.updateMany(
      { boardId, columnId: card.columnId, position: { $gt: card.position } },
      { $inc: { position: -1 } },
    );
  },
};
