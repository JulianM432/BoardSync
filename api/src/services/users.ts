import { UserDocument, UserModel } from "../models/user.js";
import { AppError } from "../utils/AppError.js";

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
  getOwnData: async (id: string): Promise<UserDocument> => {
    const user = await UserModel.findById(id).select(
      "username email role",
    );
    if (!user) {
      throw new AppError(404, "Usuario no encontrado");
    }
    return user;
  },
  delete: async (id: string): Promise<void> => {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      throw new AppError(404, "Usuario no encontrado");
    }
  },
};
