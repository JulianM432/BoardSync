import { Types } from "mongoose";
import { BoardModel } from "../models/board.js";
import { CardModel } from "../models/card.js";
import { ColumnModel } from "../models/column.js";
import type { AuthUser } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { can, getBoardRole } from "../config/board-permissions.js";
import type {
  CreateColumnInput,
  UpdateColumnInput,
} from "../schemas/column.js";

async function requireColumnBoardAccess(
  boardId: string,
  user: AuthUser,
  permission: "board:read" | "column:manage",
) {
  if (!Types.ObjectId.isValid(boardId))
    throw new AppError(400, "boardId invalid");
  const board = await BoardModel.findById(boardId).select("ownerId members");
  if (!board) throw new AppError(404, "Board not found");
  if (!can(getBoardRole(board, user.id), permission))
    throw new AppError(403, "Forbidden");
  return board;
}

function validateColumnId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError(400, "id invalid");
}

export const ColumnService = {
  getColumns: async (boardId: string, user: AuthUser) => {
    await requireColumnBoardAccess(boardId, user, "board:read");
    return ColumnModel.find({ boardId })
      .sort({ position: 1, createdAt: 1 })
      .lean();
  },
  getColumn: async (boardId: string, id: string, user: AuthUser) => {
    await requireColumnBoardAccess(boardId, user, "board:read");
    validateColumnId(id);
    const column = await ColumnModel.findOne({ _id: id, boardId }).lean();
    if (!column) throw new AppError(404, "Column not found");
    return column;
  },
  createColumn: async (
    boardId: string,
    input: CreateColumnInput,
    user: AuthUser,
  ) => {
    await requireColumnBoardAccess(boardId, user, "column:manage");
    const position = await ColumnModel.countDocuments({ boardId });
    return ColumnModel.create({ ...input, boardId, position });
  },
  updateColumn: async (
    boardId: string,
    id: string,
    input: UpdateColumnInput,
    user: AuthUser,
  ) => {
    await requireColumnBoardAccess(boardId, user, "column:manage");
    validateColumnId(id);
    const column = await ColumnModel.findOneAndUpdate(
      { _id: id, boardId },
      { $set: input },
      { returnDocument: "after", runValidators: true },
    );
    if (!column) throw new AppError(404, "Column not found");
    return column;
  },
  deleteColumn: async (
    boardId: string,
    id: string,
    user: AuthUser,
  ): Promise<void> => {
    await requireColumnBoardAccess(boardId, user, "column:manage");
    validateColumnId(id);
    const column = await ColumnModel.findOneAndDelete({ _id: id, boardId });
    if (!column) throw new AppError(404, "Column not found");
    await CardModel.deleteMany({ columnId: id, boardId });
    await ColumnModel.updateMany(
      { boardId, position: { $gt: column.position } },
      { $inc: { position: -1 } },
    );
  },
};
