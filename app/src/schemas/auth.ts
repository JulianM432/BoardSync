import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
  .regex(/\d/, "La contraseña debe tener al menos un número")
  .regex(/[^A-Za-z0-9]/, "La contraseña debe tener al menos un símbolo");

export const RegisterSchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: passwordSchema,
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
