import { Schema, model, type HydratedDocument } from "mongoose";
import { type Role, ROLES } from "../config/permissions.js";

interface IUser {
  username: string;
  email: string;
  password: string;
  role: Role;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ROLES, default: "user" },
});

export const UserModel = model("user", userSchema);
