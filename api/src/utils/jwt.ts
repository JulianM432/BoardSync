import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { ROLES, type Role } from "../config/permissions.js";

export interface AuthUser {
  id: string;
  role: Role;
}

export const signToken = (user: AuthUser) =>
  jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: "HS256",
  });

// Validamos el payload en runtime en vez de castearlo
const tokenPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(ROLES),
});

export const verifyToken = (token: string): AuthUser => {
  const payload = tokenPayloadSchema.parse(jwt.verify(token, env.JWT_SECRET));
  return { id: payload.sub, role: payload.role };
};
