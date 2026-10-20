import { z } from "zod";
import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

type ExpiresIn = NonNullable<SignOptions["expiresIn"]>;

const MS_FORMAT = /^\d+(\.\d+)?\s?(ms|s|m|h|d|w|y)?$/i;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z
    .custom<ExpiresIn>(
      (value) => typeof value === "string" && MS_FORMAT.test(value),
      "JWT_EXPIRES_IN invalido (ej: 1h, 7d)",
    )
    .default("1h"),
  FRONTEND_URL: z.string().min(1),
});

export const env = envSchema.parse(process.env);
