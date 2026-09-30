import { Request, Response } from "express";
import { UsersService } from "../services/users.js";
import { AppError } from "../utils/AppError.js";

export const UsersController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const users = await UsersService.getAll();
      return res.status(200).json(users);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  },
  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const user = await UsersService.getById(req.params.id);
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  },
  getOwnData: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autorizado" });
      }
      const user = await UsersService.getOwnData(req.user.id);
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  },
  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      await UsersService.delete(req.params.id);
      return res.status(204).json({ message: "Usuario eliminado" });
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
