import { generateKeyBetween } from "fractional-indexing";
import { Types } from "mongoose";
import { BoardModel } from "../models/board.js";
import { CardModel } from "../models/card.js";
import { ColumnModel } from "../models/column.js";
import type { AuthUser } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { can, getBoardRole } from "../config/board-permissions.js";
import type {
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput,
} from "../schemas/card.js";

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
      .sort({ columnId: 1, position: 1, _id: 1 })
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

    const last = await CardModel.findOne({ boardId, columnId: input.columnId })
      .sort({ position: -1, _id: -1 })
      .select("position")
      .lean();

    return CardModel.create({
      ...input,
      description: input.description ?? "",
      boardId,
      createdBy: user.id,
      position: generateKeyBetween(last?.position ?? null, null),
    });
  },
  updateCard: async (
    boardId: string,
    id: string,
    input: UpdateCardInput,
    user: AuthUser,
  ) => {
    const role = await getBoardRoleForUser(boardId, user);
    if (!can(role, "card:write")) {
      throw new AppError(403, "Forbidden");
    }
    validateCardId(id);
    const card = await CardModel.findOne({ _id: id, boardId });
    if (!card) {
      throw new AppError(404, "Card not found");
    }
    if (input.title !== undefined) {
      card.title = input.title;
    }
    if (input.description !== undefined) {
      card.description = input.description;
    }
    await card.save();
    return card;
  },
  deleteCard: async (
    boardId: string,
    id: string,
    user: AuthUser,
  ): Promise<void> => {
    const role = await getBoardRoleForUser(boardId, user);
    if (!can(role, "card:write")) {
      throw new AppError(403, "Forbidden");
    }
    validateCardId(id);
    const card = await CardModel.findOneAndDelete({ _id: id, boardId });
    if (!card) {
      throw new AppError(404, "Card not found");
    }
  },
  moveCard: async (
    boardId: string,
    id: string,
    input: MoveCardInput,
    user: AuthUser,
  ) => {
    const role = await getBoardRoleForUser(boardId, user);
    if (!can(role, "card:write")) {
      throw new AppError(403, "Forbidden");
    }
    validateCardId(id);

    const { columnId, prevId, nextId } = input;
    if (prevId === id || nextId === id) {
      throw new AppError(400, "A card cannot be moved to itself");
    }
    const [card, column] = await Promise.all([
      CardModel.findOne({ _id: id, boardId }),
      ColumnModel.findOne({ _id: columnId, boardId }).lean(),
    ]);
    if (!card) {
      throw new AppError(404, "Card not found");
    }
    if (!column) {
      throw new AppError(404, "Column not found");
    }
    const siblingCards = { boardId, columnId, _id: { $ne: id } };
    const findAnchor = (anchorId: string) =>
      CardModel.findOne({ ...siblingCards, _id: anchorId })
        .select("position")
        .lean();
    const [prev, next] = await Promise.all([
      prevId ? findAnchor(prevId) : null,
      nextId ? findAnchor(nextId) : null,
    ]);
    if (prevId && nextId) {
      const between = await CardModel.findOne({
        ...siblingCards,
        position: { $gt: prev?.position, $lt: next?.position },
      });
      if (between) {
        throw new AppError(409, "Anchors are not adjacent");
      }
    } else if (prevId && !prev) {
      throw new AppError(409, "prevId not found in destination column");
    }
    if (nextId && !next) {
      throw new AppError(409, "nextId not found in destination column");
    }
    let lower = prev?.position ?? null;
    let upper = next?.position ?? null;

    if (prev && !next) {
      const after = await CardModel.findOne({
        ...siblingCards,
        position: { $gt: prev.position },
      })
        .sort({ position: -1, _id: 1 })
        .select("position")
        .lean();
      upper = after?.position ?? null;
    } else if (next && !prev) {
      const before = await CardModel.findOne({
        ...siblingCards,
        position: { $lt: next.position },
      })
        .sort({ position: 1, _id: -1 })
        .select("position")
        .lean();
      lower = before?.position ?? null;
    } else if (!prev && !next) {
      const last = await CardModel.findOne(siblingCards)
        .sort({ position: -1, _id: -1 })
        .select("position")
        .lean();
      lower = last?.position ?? null;
    }
    // Anclas inconsistentes (estado stale, o duplicados por concurrencia por ej.)
    if (lower !== null && upper !== null && lower >= upper) {
      throw new AppError(409, "Stale position, refetch the board");
    }
    card.position = generateKeyBetween(lower, upper);
    card.columnId = new Types.ObjectId(columnId);
    await card.save();
    return card;
  },
};
