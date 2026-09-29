import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

const isJsonParseError = (
  err: unknown,
): err is SyntaxError & { status: number; type: string } =>
  err instanceof SyntaxError &&
  "status" in err &&
  err.status === 400 &&
  "type" in err &&
  err.type === "entity.parse.failed";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (isJsonParseError(err)) {
    res.status(400).json({ message: "JSON inválido" });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
};
