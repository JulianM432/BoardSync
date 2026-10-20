import { UserDocument, UserModel } from "../models/user.js";
import { AppError } from "../utils/AppError.js";

export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

export const UsersService = {
  getAll: async (): Promise<UserDocument[]> => {
    const users = await UserModel.find().select("username email role");
    return users;
  },
  getById: async (id: string): Promise<UserDocument> => {
    const user = await UserModel.findById(id).select("username email role");
    if (!user) {
      throw new AppError(404, "Usuario no encontrado");
    }
    return user;
  },
  getOwnData: async (id: string): Promise<User> => {
    const user = await UserModel.findById(id).select("username email role");
    if (!user) {
      throw new AppError(404, "Usuario no encontrado");
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  },
  delete: async (id: string): Promise<void> => {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      throw new AppError(404, "Usuario no encontrado");
    }
  },
};
