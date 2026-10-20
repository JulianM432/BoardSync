import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { columnAPI, type ColumnInput } from "@/features/boards/api/column";
import { boardQueries } from "@/features/boards/api/queries";

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ColumnInput) => columnAPI.createColumn(boardId, input),
    onSuccess: async () => {
      toast.success("Columna creada");
      await queryClient.invalidateQueries({
        queryKey: boardQueries.columns(boardId).queryKey,
      });
    },
  });
}

export function useUpdateColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: ColumnInput & { id: string }) =>
      columnAPI.updateColumn(boardId, id, input),
    onSuccess: async () => {
      toast.success("Columna actualizada");
      await queryClient.invalidateQueries({
        queryKey: boardQueries.columns(boardId).queryKey,
      });
    },
  });
}

export function useDeleteColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => columnAPI.deleteColumn(boardId, id),
    onSuccess: async () => {
      toast.success("Columna eliminada");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: boardQueries.columns(boardId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: boardQueries.cards(boardId).queryKey,
        }),
      ]);
    },
  });
}
