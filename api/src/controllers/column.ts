import type { Request, Response } from "express";
import { ColumnService } from "../services/column.js";
import { AppError } from "../utils/AppError.js";
import { requireUser } from "../utils/requireUser.js";

function sendError(res: Response, error: unknown) {
  if (error instanceof AppError)
    return res
      .status(error.status)
      .json({ message: error.message, code: error.code });
  return res.status(500).json({ message: "Error interno" });
}

export const ColumnController = {
  getColumns: async (req: Request<{ boardId: string }>, res: Response) => {
    try {
      const response = await ColumnService.getColumns(
        req.params.boardId,
        requireUser(req),
      );
      return res.status(200).json(response);
    } catch (error) {
      return sendError(res, error);
    }
  },
  getColumn: async (
    req: Request<{ boardId: string; id: string }>,
    res: Response,
  ) => {
    try {
      const response = await ColumnService.getColumn(
        req.params.boardId,
        req.params.id,
        requireUser(req),
      );
      return res.status(200).json(response);
    } catch (error) {
      return sendError(res, error);
    }
  },
  createColumn: async (req: Request<{ boardId: string }>, res: Response) => {
    try {
      const response = await ColumnService.createColumn(
        req.params.boardId,
        req.body,
        requireUser(req),
      );
      return res.status(201).json(response);
    } catch (error) {
      return sendError(res, error);
    }
  },
  updateColumn: async (
    req: Request<{ boardId: string; id: string }>,
    res: Response,
  ) => {
    try {
      const response = await ColumnService.updateColumn(
        req.params.boardId,
        req.params.id,
        req.body,
        requireUser(req),
      );
      return res.status(200).json(response);
    } catch (error) {
      return sendError(res, error);
    }
  },
  deleteColumn: async (
    req: Request<{ boardId: string; id: string }>,
    res: Response,
  ) => {
    try {
      await ColumnService.deleteColumn(
        req.params.boardId,
        req.params.id,
        requireUser(req),
      );
      return res.status(204).end();
    } catch (error) {
      return sendError(res, error);
    }
  },
};
