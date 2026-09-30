import { Router } from "express";
import { BoardController } from "../controllers/board.js";
import { createBoardSchema, updateBoardSchema } from "../schemas/board.js";
import { validateSchema } from "../middlewares/validate.js";

export const boardRouter = Router();

boardRouter.post(
  "/",
  validateSchema(createBoardSchema),
  BoardController.createBoard,
);
boardRouter.get("/", BoardController.getBoards);
boardRouter.get("/:id", BoardController.getBoard);
boardRouter.patch(
  "/:id",
  validateSchema(updateBoardSchema),
  BoardController.updateBoard,
);
boardRouter.delete("/:id", BoardController.deleteBoard);
