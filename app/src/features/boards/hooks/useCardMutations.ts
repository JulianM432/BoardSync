import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cardAPI,
  type CreateCardInput,
  type UpdateCardInput,
} from "@/features/boards/api/card";
import { boardQueries } from "@/features/boards/api/queries";

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
