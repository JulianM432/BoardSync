import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { boardQueries } from "@/features/boards/api/queries";
import {
  socket,
  type BoardEventName,
  type BoardEventPayload,
} from "@/lib/socket";

type QueryTarget = "cards" | "columns";

const EVENT_TARGETS: [
  Exclude<BoardEventName, "board:updated" | "board:deleted">,
  QueryTarget[],
][] = [
  ["card:created", ["cards"]],
  ["card:updated", ["cards"]],
  ["card:deleted", ["cards"]],
  ["card:moved", ["cards"]],
  ["column:created", ["columns"]],
  ["column:updated", ["columns"]],
  ["column:deleted", ["columns", "cards"]],
];

export function useBoardRealtime(boardId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const leaveBoard = (message: string) => {
      toast.info(message);
      void navigate({ to: "/" }).then(() => {
        queryClient.removeQueries({
          queryKey: boardQueries.detail(boardId).queryKey,
        });
      });
    };

    const join = () => {
      socket.emit("board:join", boardId, (result) => {
        if (!result.ok) {
          leaveBoard("Ya no tenés acceso a este board");
        }
      });
    };

    const invalidate = (targets: QueryTarget[]) => {
      for (const target of targets) {
        void queryClient.invalidateQueries({
          queryKey: boardQueries[target](boardId).queryKey,
          exact: true,
        });
      }
    };

    const listeners = EVENT_TARGETS.map(([event, targets]) => {
      const listener = (payload: BoardEventPayload) => {
        if (payload.boardId === boardId) {
          invalidate(targets);
        }
      };
      return { event, listener };
    });

    const onBoardUpdated = (payload: BoardEventPayload) => {
      if (payload.boardId !== boardId) {
        return;
      }
      queryClient
        .query({ ...boardQueries.detail(boardId), staleTime: 0 })
        .catch(() => leaveBoard("Ya no tenés acceso a este board"));
    };

    const onBoardDeleted = (payload: BoardEventPayload) => {
      if (payload.boardId === boardId) {
        leaveBoard("El board fue eliminado");
      }
    };

    if (socket.connected) {
      join();
    }
    socket.on("connect", join);
    for (const { event, listener } of listeners) {
      socket.on(event, listener);
    }
    socket.on("board:updated", onBoardUpdated);
    socket.on("board:deleted", onBoardDeleted);

    return () => {
      socket.emit("board:leave", boardId);
      socket.off("connect", join);
      for (const { event, listener } of listeners) {
        socket.off(event, listener);
      }
      socket.off("board:updated", onBoardUpdated);
      socket.off("board:deleted", onBoardDeleted);
    };
  }, [boardId, queryClient, navigate]);
}
