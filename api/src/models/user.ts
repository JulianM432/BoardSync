import { Schema, model } from "mongoose";
import { type Role, ROLES } from "../config/permissions.js";

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: Role;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ROLES, default: "user" },
});

export const UserModel = model("user", userSchema);
