import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cardAPI,
  type CreateCardInput,
  type UpdateCardInput,
} from "@/features/boards/api/card";
import { boardQueries } from "@/features/boards/api/queries";
import { applyOptimisticMove, type CardMove } from "@/features/cards/move";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/axios-config";

export function useCreateCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCardInput) => cardAPI.createCard(boardId, input),
    onSuccess: async () => {
      toast.success("Tarjeta creada");
      await queryClient.invalidateQueries({
        queryKey: boardQueries.cards(boardId).queryKey,
      });
    },
  });
}

export function useUpdateCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateCardInput & { id: string }) =>
      cardAPI.updateCard(boardId, id, input),
    onSuccess: async () => {
      toast.success("Tarjeta actualizada");
      await queryClient.invalidateQueries({
        queryKey: boardQueries.cards(boardId).queryKey,
      });
    },
  });
}

export function useDeleteCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cardAPI.deleteCard(boardId, id),
    onSuccess: async () => {
      toast.success("Tarjeta eliminada");
      await queryClient.invalidateQueries({
        queryKey: boardQueries.cards(boardId).queryKey,
      });
    },
  });
}

export function useMoveCard(boardId: string) {
  const queryClient = useQueryClient();
  const { queryKey } = boardQueries.cards(boardId);

  return useMutation({
    mutationFn: ({ id, ...input }: CardMove) =>
      cardAPI.moveCard(boardId, id, input),
    meta: { silentError: true },
    onMutate: async (move) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (cards) =>
        cards ? applyOptimisticMove(cards, move) : cards,
      );
      return { previous };
    },
    onError: (error, _move, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      if (getApiErrorStatus(error) === 409) {
        toast.error("La tarjeta cambió de lugar, se recargó el board");
      } else if (getApiErrorStatus(error) !== 401) {
        toast.error(getApiErrorMessage(error, "No se pudo mover la tarjeta"));
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });
}
