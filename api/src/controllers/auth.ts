import { Request, Response } from "express";
import { AuthService } from "../services/auth.js";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

export const AuthController = {
  login: async (req: Request, res: Response) => {
    try {
      const response = await AuthService.login(req.body);
      res.cookie("token", response.token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 43200000, // 12 hours
      });
      return res.status(200).json(response.user); 
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  },
  register: async (req: Request, res: Response) => {
    try {
      const response = await AuthService.register(req.body);
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return res.status(500).json({ message: "Error interno" });
    }
  },
  logout: async (_req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({ message: "Sesión cerrada" });
  },
};
