import { Request, Response } from "express";
import { BoardService } from "../services/board.js";
import { AppError } from "../utils/AppError.js";
import { getBoardsSchema } from "../schemas/board.js";
import { ZodError } from "zod";
import { requireUser } from "../utils/requireUser.js";

export const BoardController = {
  createBoard: async (req: Request, res: Response) => {
    try {
      const board = await BoardService.createBoard({
        ...req.body,
        ownerId: requireUser(req).id,
      });
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
      const boards = await BoardService.getBoards(filters);
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
      const board = await BoardService.getBoard(req.params.id);
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
      const board = await BoardService.updateBoard(req.params.id, req.body);
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
      await BoardService.deleteBoard(req.params.id);
      return res.status(204).json({ message: "Board deleted" });
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
