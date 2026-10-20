import { Types } from "mongoose";
import { BoardModel } from "../models/board.js";
import { getBoardRole } from "../config/board-permissions.js";
import type { AuthUser } from "./jwt.js";
import { AppError } from "./AppError.js";

export async function requireBoardRole(boardId: string, user: AuthUser) {
  if (!Types.ObjectId.isValid(boardId)) {
    throw new AppError(400, "boardId invalid");
  }
  const board = await BoardModel.findById(boardId).select("ownerId members");
  if (!board) {
    throw new AppError(404, "Board not found");
  }
  const role = getBoardRole(board, user.id);
  // 404 para no revelar la existencia del board
  if (!role) {
    throw new AppError(404, "Board not found");
  }
  return { board, role };
}
