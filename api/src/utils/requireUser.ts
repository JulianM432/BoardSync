import { Request } from "express";
import { AppError } from "./AppError.js";
import { AuthUser } from "./jwt.js";

export function requireUser(req: Request): AuthUser {
  if (!req.user) {
    {
      throw new AppError(401, "No autorizado");
    }
  }
  return req.user;
}
