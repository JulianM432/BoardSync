import { Router } from "express";
import { ColumnController } from "../controllers/column.js";
import { validateSchema } from "../middlewares/validate.js";
import { createColumnSchema, updateColumnSchema } from "../schemas/column.js";

export const columnsRouter = Router({ mergeParams: true });
columnsRouter.get("/", ColumnController.getColumns);
columnsRouter.post(
  "/",
  validateSchema(createColumnSchema),
  ColumnController.createColumn,
);
columnsRouter.get("/:id", ColumnController.getColumn);
columnsRouter.patch(
  "/:id",
  validateSchema(updateColumnSchema),
  ColumnController.updateColumn,
);
columnsRouter.delete("/:id", ColumnController.deleteColumn);
