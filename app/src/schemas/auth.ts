import { z } from "zod";

export const RegisterSchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.email(),
  role: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type RegisterCredentials = z.infer<typeof RegisterSchema>;
export type LoginCredentials = z.infer<typeof LoginSchema>;
