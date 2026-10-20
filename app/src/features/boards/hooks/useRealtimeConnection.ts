import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { boardQueries } from "@/features/boards/api/queries";
import { socket } from "@/lib/socket";

export function useRealtimeConnection() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onBoardsChanged = () => {
      void queryClient.invalidateQueries({
        queryKey: boardQueries.list().queryKey,
      });
    };

    socket.on("boards:changed", onBoardsChanged);
    socket.connect();

    return () => {
      socket.off("boards:changed", onBoardsChanged);
      socket.disconnect();
    };
  }, [queryClient]);
}
