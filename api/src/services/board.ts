import { QueryFilter, Types, mongo } from "mongoose";
import { type IBoard, type MemberRole, BoardModel } from "../models/board.js";
import { CardModel } from "../models/card.js";
import { ColumnModel } from "../models/column.js";
import { UserModel } from "../models/user.js";
import { can } from "../config/board-permissions.js";
import type {
  BoardFilters,
  CreateBoardInput,
  UpdateBoardInput,
} from "../schemas/board.js";
import { AppError } from "../utils/AppError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import type { AuthUser } from "../utils/jwt.js";
import { requireBoardRole } from "../utils/requireBoardRole.js";

type UserRef = { _id: Types.ObjectId; username: string };

// Tipos de los paths poblados por BOARD_POPULATE, para `populate<T>()`
type PopulatedBoardPaths = {
  ownerId: UserRef;
  members: { userId: UserRef; role: MemberRole }[];
};

const BOARD_POPULATE = [
  { path: "ownerId", select: "username" },
  { path: "members.userId", select: "username" },
];

async function validateMembers(
  ownerId: Types.ObjectId | string,
  members: { userId: string }[] | undefined,
) {
  if (!members || members.length === 0) {
    return;
  }
  const ids = members.map((m) => m.userId);
  if (ids.some((id) => ownerId.toString() === id)) {
    throw new AppError(400, "El owner no puede ser miembro");
  }
  const count = await UserModel.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) {
    throw new AppError(400, "Usuario miembro inexistente");
  }
}

function handleDuplicateName(error: unknown): never {
  if (error instanceof mongo.MongoServerError && error.code === 11000) {
    throw new AppError(409, "Ya existe este nombre");
  }
  throw error;
}

export const BoardService = {
  createBoard: async (input: CreateBoardInput) => {
    await validateMembers(input.ownerId, input.members);
    try {
      const board = await BoardModel.create(input);
      return await board.populate<PopulatedBoardPaths>(BOARD_POPULATE);
    } catch (error) {
      return handleDuplicateName(error);
    }
  },
  getBoards: async ({ name }: BoardFilters, user: AuthUser) => {
    const query: QueryFilter<IBoard> = {
      $or: [{ ownerId: user.id }, { "members.userId": user.id }],
    };
    if (name) {
      query.name = { $regex: escapeRegex(name), $options: "i" };
    }
    const boards = await BoardModel.find(query)
      .select("name ownerId members createdAt updatedAt")
      .populate<PopulatedBoardPaths>(BOARD_POPULATE)
      .lean();
    return boards;
  },
  getBoard: async (id: string, user: AuthUser) => {
    await requireBoardRole(id, user);
    const board = await BoardModel.findOne({ _id: id })
      .select("name ownerId members createdAt updatedAt")
      .populate<PopulatedBoardPaths>(BOARD_POPULATE)
      .lean();
    if (!board) {
      throw new AppError(404, "Board not found");
    }
    return board;
  },
  deleteBoard: async (id: string, user: AuthUser): Promise<void> => {
    const { role } = await requireBoardRole(id, user);
    if (!can(role, "board:manage")) {
      throw new AppError(403, "Forbidden");
    }
    await Promise.all([
      CardModel.deleteMany({ boardId: id }),
      ColumnModel.deleteMany({ boardId: id }),
      BoardModel.deleteOne({ _id: id }),
    ]);
  },
  updateBoard: async (id: string, input: UpdateBoardInput, user: AuthUser) => {
    const { board: current, role } = await requireBoardRole(id, user);
    if (!can(role, "board:manage")) {
      throw new AppError(403, "Forbidden");
    }
    await validateMembers(current.ownerId, input.members);
    try {
      const board = await BoardModel.findByIdAndUpdate(
        id,
        { $set: input },
        { returnDocument: "after", runValidators: true },
      ).populate<PopulatedBoardPaths>(BOARD_POPULATE);
      if (!board) {
        throw new AppError(404, "Board not found");
      }
      return board;
    } catch (error) {
      return handleDuplicateName(error);
    }
  },
};
