import type { QueryFilter, Types } from "mongoose";
import {
  type BoardDocument,
  type IBoard,
  BoardModel,
} from "../models/board.js";
import type {
  BoardFilters,
  CreateBoardInput,
  UpdateBoardInput,
} from "../schemas/board.js";
import { AppError } from "../utils/AppError.js";
import { escapeRegex } from "../utils/escapeRegex.js";

type BoardLean = IBoard & { _id: Types.ObjectId };

export const BoardService = {
  createBoard: async (input: CreateBoardInput): Promise<BoardDocument> => {
    const board = await BoardModel.create(input);
    return board;
  },
  getBoards: async ({ name, ownerId }: BoardFilters): Promise<BoardLean[]> => {
    const query: QueryFilter<IBoard> = {};
    if (name) {
      query.name = { $regex: escapeRegex(name), $options: "i" };
    }
    if (ownerId) {
      query.ownerId = ownerId;
    }
    const boards = await BoardModel.find(query)
      .select("name ownerId members createdAt updatedAt")
      .lean();
    return boards;
  },
  getBoard: async (id: string): Promise<BoardLean> => {
    const board = await BoardModel.findOne({ _id: id })
      .select("name ownerId members createdAt updatedAt")
      .lean();
    if (!board) {
      throw new AppError(404, "Board not found");
    }
    return board;
  },
  deleteBoard: async (id: string): Promise<void> => {
    const board = await BoardModel.findOne({ _id: id });
    if (!board) {
      throw new AppError(404, "Board not found");
    }
    await board.deleteOne();
  },
  updateBoard: async (
    id: string,
    input: UpdateBoardInput,
  ): Promise<BoardDocument> => {
    const board = await BoardModel.findByIdAndUpdate(
      id,
      { $set: input },
      {
        returnDocument: "after",
      },
    );
    if (!board) {
      throw new AppError(404, "Board not found");
    }
    return board;
  },
};
