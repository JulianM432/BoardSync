import { z } from "zod";
import { Types } from "mongoose";

const objectId = (field: string) =>
  z.string().refine(Types.ObjectId.isValid, `${field} invalid`);

export const createColumnSchema = z.object({
  name: z.string().trim().min(1).max(200),
});

export const updateColumnSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    position: z.number().int().min(0).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo",
  });

export const columnParamsSchema = z.object({
  boardId: objectId("boardId"),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
