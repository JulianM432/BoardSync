import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { boardApi, type BoardInput } from "@/features/boards/api/board";
import { boardQueries } from "@/features/boards/api/queries";

export function useCreateBoard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: BoardInput) => boardApi.createBoard(input),
    onSuccess: async (board) => {
      toast.success("Board creado");
      await queryClient.invalidateQueries({ queryKey: boardQueries.all() });
      await navigate({
        to: "/boards/$boardId",
        params: { boardId: board._id },
      });
    },
  });
}

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BoardInput) => boardApi.updateBoard(boardId, input),
    onSuccess: async () => {
      toast.success("Board actualizado");
      await queryClient.invalidateQueries({ queryKey: boardQueries.all() });
    },
  });
}

export function useDeleteBoard(boardId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => boardApi.deleteBoard(boardId),
    onSuccess: async () => {
      toast.success("Board eliminado");
      await navigate({ to: "/" });
      queryClient.removeQueries({
        queryKey: boardQueries.detail(boardId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: boardQueries.list().queryKey,
      });
    },
  });
}
