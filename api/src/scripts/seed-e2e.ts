import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { z } from "zod";
import { ROLES } from "../config/permissions.js";
import { UserModel } from "../models/user.js";

const seedEnvSchema = z.object({
  MONGO_URI: z.string().min(1),
  E2E_PASSWORD: z.string().min(8),
  E2E_USERS: z.string().transform((value, ctx) => {
    const parsed = z
      .array(
        z.object({
          email: z.email(),
          username: z.string().min(1),
          role: z.enum(ROLES),
        }),
      )
      .safeParse(JSON.parse(value));
    if (!parsed.success) {
      ctx.addIssue({ code: "custom", message: "E2E_USERS inválido" });
      return z.NEVER;
    }
    return parsed.data;
  }),
});

const { MONGO_URI, E2E_PASSWORD, E2E_USERS } = seedEnvSchema.parse(
  process.env,
);

await mongoose.connect(MONGO_URI);

if (!mongoose.connection.name.endsWith("_e2e")) {
  await mongoose.disconnect();
  throw new Error(
    `La base "${mongoose.connection.name}" no es de e2e: el seed solo corre sobre bases que terminan en _e2e`,
  );
}

await mongoose.connection.dropDatabase();
const password = await bcrypt.hash(E2E_PASSWORD, 10);
await UserModel.insertMany(E2E_USERS.map((user) => ({ ...user, password })));
console.log(`Seed e2e: ${E2E_USERS.length} usuarios en ${mongoose.connection.name}`);
await mongoose.disconnect();
