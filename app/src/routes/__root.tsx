import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { meQueryOptions } from "@/features/auth/api/queries";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RootLayout } from "@/pages/RootLayout";

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => ({
    user: await context.queryClient.query({
      ...meQueryOptions,
      staleTime: "static",
    }),
  }),
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});
