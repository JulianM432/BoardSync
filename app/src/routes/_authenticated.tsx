import { createFileRoute, redirect } from "@tanstack/react-router";
import { boardQueries } from "@/features/boards/api/queries";
import { AuthenticatedLayout } from "@/pages/AuthenticatedLayout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { user: context.user };
  },
  loader: ({ context }) =>
    context.queryClient.query({ ...boardQueries.list(), staleTime: "static" }),
  component: AuthenticatedLayout,
});
