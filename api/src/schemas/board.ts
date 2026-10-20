import { z } from "zod";
import { MEMBER_ROLES } from "../models/board.js";
import { objectId } from "./common.js";

const memberSchema = z.object({
  userId: objectId("userId"),
  role: z.enum(MEMBER_ROLES),
});

const uniqueMembers = (members?: { userId: string }[]) => {
  return (
    !members || new Set(members.map((m) => m.userId)).size === members.length
  );
};

const baseBoardSchema = z.object({
  name: z.string().trim().min(3).max(200),
  members: z.array(memberSchema),
});

export const createBoardSchema = z
  .object({
    name: z.string().trim().min(3).max(200),
    members: z.array(memberSchema).default([]),
  })
  .strict()
  .refine((data) => uniqueMembers(data.members), {
    message: "Miembros duplicados",
  });

export const updateBoardSchema = baseBoardSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo",
  })
  .refine((data) => uniqueMembers(data.members), {
    message: "Miembros duplicados",
  });

export const getBoardsSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  ownerId: objectId("ownerId").optional(),
});

export type BoardFilters = z.infer<typeof getBoardsSchema>;

export type CreateBoardInput = z.infer<typeof createBoardSchema> & {
  ownerId: string;
};
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
