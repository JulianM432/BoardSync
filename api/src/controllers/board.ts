import { Request, Response } from "express";
import { BoardService } from "../services/board.js";
import { AppError } from "../utils/AppError.js";
import { getBoardsSchema } from "../schemas/board.js";
import { ZodError } from "zod";
import { requireUser } from "../utils/requireUser.js";
import {
  emitToBoard,
  notifyBoardsChanged,
  removeNonMembers,
} from "../sockets/emitter.js";

export const BoardController = {
  createBoard: async (req: Request, res: Response) => {
    try {
      const { board, userIds } = await BoardService.createBoard({
        ...req.body,
        ownerId: requireUser(req).id,
      });
      notifyBoardsChanged(userIds);
      return res.status(201).json(board);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  },
  getBoards: async (req: Request, res: Response) => {
    try {
      const filters = getBoardsSchema.parse(req.query);
      const boards = await BoardService.getBoards(filters, requireUser(req));
      return res.status(200).json(boards);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Query invalido", errors: error.issues });
      }
      if (error instanceof AppError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  },
  getBoard: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const board = await BoardService.getBoard(
        req.params.id,
        requireUser(req),
      );
      return res.status(200).json(board);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  },

  updateBoard: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { board, userIds, affectedUserIds } =
        await BoardService.updateBoard(
          req.params.id,
          req.body,
          requireUser(req),
        );
      emitToBoard(req, req.params.id, "board:updated");
      await removeNonMembers(req.params.id, userIds);
      notifyBoardsChanged(affectedUserIds);
      return res.status(200).json(board);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  },
  deleteBoard: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const userIds = await BoardService.deleteBoard(
        req.params.id,
        requireUser(req),
      );
      emitToBoard(req, req.params.id, "board:deleted");
      notifyBoardsChanged(userIds);
      return res.status(204).end();
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  },
};
