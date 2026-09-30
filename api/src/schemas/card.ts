import { z } from "zod";
import { Types } from "mongoose";

const objectId = (field: string) =>
  z.string().refine(Types.ObjectId.isValid, `${field} invalid`);

export const createCardSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().optional(),
  columnId: objectId("columnId"),
});

export const updateCardSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().optional(),
    columnId: objectId("columnId").optional(),
    position: z.number().int().min(0).optional(),
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

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
