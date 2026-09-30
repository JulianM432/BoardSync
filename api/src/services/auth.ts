import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt.js";
import { UserModel } from "../models/user.js";
import { AppError } from "../utils/AppError.js";
import { User } from "./users.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.js";

interface AuthResult {
  token: string;
  user: User;
}

export const AuthService = {
  login: async (input: LoginInput): Promise<AuthResult> => {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      throw new AppError(404, "Usuario no encontrado", "USER_NOT_FOUND");
    }
    const isValidPassword = await bcrypt.compare(input.password, user.password);
    if (!isValidPassword) throw new AppError(401, "Contraseña incorrecta");
    const token = signToken({ id: user.id, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  },
  register: async (input: RegisterInput) => {
    const existing = await UserModel.findOne({ email: input.email });
    if (existing) {
      throw new AppError(400, "Email ya registrado");
    }
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await UserModel.create({
      ...input,
      password: hashedPassword,
    });
    return { id: user.id, username: user.username, email: user.email };
  },
};
