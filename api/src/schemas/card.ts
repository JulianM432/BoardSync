import { z } from "zod";
import { objectId } from "./common.js";

export const createCardSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().optional(),
  columnId: objectId("columnId"),
  assignedTo: objectId("assignedTo").nullish(),
});

export const updateCardSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().optional(),
    assignedTo: objectId("assignedTo").nullish(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo",
  });

export const cardParamsSchema = z.object({
  boardId: objectId("boardId"),
});

export const cardQuerySchema = z.object({
  columnId: objectId("columnId").optional(),
});

export const moveCardSchema = z.object({
  columnId: objectId("columnId"),
  prevId: objectId("prevId").nullish(),
  nextId: objectId("nextId").nullish(),
});

export type MoveCardInput = z.infer<typeof moveCardSchema>;

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
