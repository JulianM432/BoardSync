import { Router } from "express";
import { AuthController } from "../controllers/auth.js";
import { validateSchema } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  validateSchema(registerSchema),
  AuthController.register,
);
authRouter.post("/login", validateSchema(loginSchema), AuthController.login);
authRouter.post("/logout", AuthController.logout);
