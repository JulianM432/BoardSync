import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";
import { findAccessRule } from "../utils/findAccessRule.js";

export function access(req: Request, _res: Response, next: NextFunction) {
  const rule = findAccessRule(req);
  if (!rule) {
    throw new AppError(403, "Access denied");
  }
  if (rule.public) {
    return next();
  }
  const token = req.cookies.token;
  if (!token) {
    throw new AppError(401, "Not authenticated");
  }
  try {
    req.user = verifyToken(token);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
  if (rule.roles && !rule.roles.includes(req.user.role)) {
    throw new AppError(403, "Forbidden");
  }
  next();
}
