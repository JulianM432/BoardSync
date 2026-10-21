import { z } from "zod";
import { isObjectIdOrHexString } from "mongoose";

export const objectId = (field: string) =>
  z
    .string()
    .refine((value) => isObjectIdOrHexString(value), `${field} invalid`);
