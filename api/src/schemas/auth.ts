import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
  .regex(/\d/, "La contraseña debe tener al menos un número")
  .regex(/[^A-Za-z0-9]/, "La contraseña debe tener al menos un símbolo");

export const registerSchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
