import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "../config/permissions.js";

export interface AuthUser {
  id: string;
  role: Role;
}

export const signToken = (user: AuthUser) =>
  jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: "15m",
  });

export const verifyToken = (token: string): AuthUser => {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & {
    role: Role;
  };
  return { id: payload.sub as string, role: payload.role };
};
