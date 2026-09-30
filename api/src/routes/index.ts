import { Router } from "express";
import { authRouter } from "./auth.js";
import { usersRouter } from "./users.js";
import { boardRouter } from "./board.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ message: "ok" });
});

router.get("/", (_req, res) => {
  res.status(200).json({ message: "Hello world" });
});

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/boards", boardRouter);

export default router;
