import { z } from "zod";
import { Types } from "mongoose";

export const objectId = (field: string) =>
  z
    .string()
    .refine((value) => Types.ObjectId.isValid(value), `${field} invalid`);
