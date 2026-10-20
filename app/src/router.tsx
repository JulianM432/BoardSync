import { createRouter } from "@tanstack/react-router";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { meQueryOptions } from "@/features/auth/api/queries";
import { createQueryClient } from "@/lib/query-client";
import { routeTree } from "./routeTree.gen";

export const queryClient = createQueryClient(() => {
  if (queryClient.getQueryData(meQueryOptions.queryKey)) {
    queryClient.setQueryData(meQueryOptions.queryKey, null);
    void router.invalidate();
  }
});

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: FullPageSpinner,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
