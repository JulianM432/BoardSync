import { z } from "zod";
import { objectId } from "./common.js";

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
    error: "Debes enviar al menos un campo",
  });

export const columnParamsSchema = z.object({
  boardId: objectId("boardId"),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
