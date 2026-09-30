import { z } from "zod";
import { Types } from "mongoose";
import { MEMBER_ROLES } from "../models/board.js";

const objectId = (field: string) =>
  z.string().refine(Types.ObjectId.isValid, `${field} invalid`);

const memberSchema = z.object({
  userId: objectId("userId"),
  role: z.enum(MEMBER_ROLES),
});


export const createBoardSchema = z.object({
  name: z.string().trim().min(3).max(200),
  members: z.array(memberSchema),
});

export const updateBoardSchema = z.object({
  name: z.string().trim().min(3).max(200).optional(),
  members: z.array(memberSchema).optional(),
});

export const getBoardsSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  ownerId: z
    .string()
    .refine(Types.ObjectId.isValid, "ownerId invalid")
    .optional(),
});

export type BoardFilters = z.infer<typeof getBoardsSchema>;

export type CreateBoardInput = z.infer<typeof createBoardSchema> & {
  ownerId: string;
};
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
