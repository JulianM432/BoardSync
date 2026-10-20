import { createFileRoute, notFound } from "@tanstack/react-router";
import { boardQueries } from "@/features/boards/api/queries";
import { getApiErrorStatus } from "@/lib/axios-config";
import { BoardNotFoundPage } from "@/pages/BoardNotFoundPage";
import { BoardPage } from "@/pages/BoardPage";

const NOT_FOUND_STATUSES = [400, 404];

export const Route = createFileRoute("/_authenticated/boards/$boardId")({
  loader: async ({ context: { queryClient }, params: { boardId } }) => {
    try {
      await Promise.all([
        queryClient.query({
          ...boardQueries.detail(boardId),
          staleTime: "static",
        }),
        queryClient.query({
          ...boardQueries.columns(boardId),
          staleTime: "static",
        }),
        queryClient.query({
          ...boardQueries.cards(boardId),
          staleTime: "static",
        }),
      ]);
    } catch (error) {
      const status = getApiErrorStatus(error);
      if (status !== undefined && NOT_FOUND_STATUSES.includes(status)) {
        throw notFound();
      }
      throw error;
    }
  },
  component: BoardPage,
  notFoundComponent: BoardNotFoundPage,
});
