import { queryOptions } from "@tanstack/react-query";
import { boardApi } from "@/features/boards/api/board";
import { cardAPI } from "@/features/boards/api/card";
import { columnAPI } from "@/features/boards/api/column";

export const boardQueries = {
  all: () => ["boards"],
  list: () =>
    queryOptions({
      queryKey: [...boardQueries.all(), "list"],
      queryFn: () => boardApi.getBoards(),
    }),
  detail: (boardId: string) =>
    queryOptions({
      queryKey: [...boardQueries.all(), boardId],
      queryFn: () => boardApi.getBoardById(boardId),
    }),
  columns: (boardId: string) =>
    queryOptions({
      queryKey: [...boardQueries.all(), boardId, "columns"],
      queryFn: () => columnAPI.getColumns(boardId),
    }),
  cards: (boardId: string) =>
    queryOptions({
      queryKey: [...boardQueries.all(), boardId, "cards"],
      queryFn: () => cardAPI.getCards(boardId),
    }),
};
