import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { LoginPage } from "@/pages/LoginPage";

const loginSearchSchema = z.object({
  redirect: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) {
      throw redirect({ href: search.redirect ?? "/" });
    }
  },
  component: LoginPage,
});
