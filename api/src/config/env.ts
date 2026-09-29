import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z.string().default("1h"),
  FRONTEND_URL: z.string().min(1),
});

export const env = envSchema.parse(process.env);
