import { Router } from "express";
import { authRouter } from "./auth.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ message: "ok" });
});

router.get("/", (_req, res) => {
  res.status(200).json({ message: "Hello world" });
});

router.use("/auth", authRouter);

export default router;
