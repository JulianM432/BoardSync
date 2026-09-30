import type { Request, Response } from "express";
import { ZodError } from "zod";
import { CardService } from "../services/card.js";
import { AppError } from "../utils/AppError.js";
import { cardQuerySchema } from "../schemas/card.js";
import { requireUser } from "../utils/requireUser.js";

function sendError(res: Response, error: unknown) {
  if (error instanceof AppError)
    return res
      .status(error.status)
      .json({ message: error.message, code: error.code });
  if (error instanceof ZodError)
    return res
      .status(400)
      .json({ message: "Query invalido", errors: error.issues });
  return res.status(500).json({ message: "Error interno" });
}

export const CardController = {
  getCards: async (req: Request<{ boardId: string }>, res: Response) => {
    try {
      const query = cardQuerySchema.parse(req.query);
      const response = await CardService.getCards(
        req.params.boardId,
        query.columnId,
        requireUser(req),
      );
      return res.status(200).json(response);
    } catch (error) {
      return sendError(res, error);
    }
  },
  getCard: async (
    req: Request<{ boardId: string; id: string }>,
    res: Response,
  ) => {
    try {
      const response = await CardService.getCard(
        req.params.boardId,
        req.params.id,
        requireUser(req),
      );
      return res.status(200).json(response);
    } catch (error) {
      return sendError(res, error);
    }
  },
  createCard: async (req: Request<{ boardId: string }>, res: Response) => {
    try {
      const response = await CardService.createCard(
        req.params.boardId,
        req.body,
        requireUser(req),
      );
      return res.status(201).json(response);
    } catch (error) {
      return sendError(res, error);
    }
  },
  updateCard: async (
    req: Request<{ boardId: string; id: string }>,
    res: Response,
  ) => {
    try {
      const response = await CardService.updateCard(
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
  deleteCard: async (
    req: Request<{ boardId: string; id: string }>,
    res: Response,
  ) => {
    try {
      await CardService.deleteCard(
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
