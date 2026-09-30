import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import router from "../routes/index.js";
import { middlewares } from "../middlewares/index.js";

export const createApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(cookieParser());
  app.use(middlewares);

  app.use("/api", router);

  return app;
};
