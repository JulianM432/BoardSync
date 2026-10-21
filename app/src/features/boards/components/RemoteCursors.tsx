import { useEffect, useState, type RefObject } from "react";
import { getUserColor } from "@/lib/user-color";
import { socket, type CursorPayload, type PeerRef } from "@/lib/socket";
import type { RemoteDrag } from "@/features/boards/hooks/useBoardPresence";

const SEND_INTERVAL_MS = 50;

type RemoteCursorsProps = {
  boardId: string;
  containerRef: RefObject<HTMLElement | null>;
  drags: RemoteDrag[];
  getCardTitle: (cardId: string) => string | undefined;
};

function useCursorBroadcast(
  boardId: string,
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    let lastSentAt = 0;
    let isInside = false;
    let trailing: ReturnType<typeof setTimeout> | undefined;

    const send = (x: number, y: number) => {
      lastSentAt = performance.now();
      socket.emit("cursor:move", { boardId, x, y });
    };

    const leave = () => {
      clearTimeout(trailing);
      if (isInside) {
        isInside = false;
        socket.emit("cursor:leave", boardId);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container || !socket.connected) {
        return;
      }
      const rect = container.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        leave();
        return;
      }
      isInside = true;
      clearTimeout(trailing);
      const elapsed = performance.now() - lastSentAt;
      if (elapsed >= SEND_INTERVAL_MS) {
        send(x, y);
      } else {
        trailing = setTimeout(() => send(x, y), SEND_INTERVAL_MS - elapsed);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);

    return () => {
      leave();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
    };
  }, [boardId, containerRef]);
}

function useRemoteCursors(boardId: string) {
  const [cursors, setCursors] = useState<Record<string, CursorPayload>>({});

  useEffect(() => {
    const onMoved = (payload: CursorPayload) => {
      if (payload.boardId === boardId) {
        setCursors((prev) => ({ ...prev, [payload.socketId]: payload }));
      }
    };

    const onLeft = (payload: PeerRef) => {
      if (payload.boardId !== boardId) {
        return;
      }
      setCursors((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([id]) => id !== payload.socketId),
        ),
      );
    };

    const onDisconnect = () => {
      setCursors({});
    };

    socket.on("cursor:moved", onMoved);
    socket.on("cursor:left", onLeft);
    socket.on("peer:left", onLeft);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("cursor:moved", onMoved);
      socket.off("cursor:left", onLeft);
      socket.off("peer:left", onLeft);
      socket.off("disconnect", onDisconnect);
    };
  }, [boardId]);

  return Object.values(cursors);
}

export const RemoteCursors = ({
  boardId,
  containerRef,
  drags,
  getCardTitle,
}: RemoteCursorsProps) => {
  useCursorBroadcast(boardId, containerRef);
  const cursors = useRemoteCursors(boardId);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {cursors.map((cursor) => {
        const color = getUserColor(cursor.userId);
        const drag = drags.find((item) => item.socketId === cursor.socketId);
        const cardTitle = drag ? getCardTitle(drag.cardId) : undefined;
        return (
          <div
            key={cursor.socketId}
            aria-label={`Cursor de ${cursor.username}`}
            className="absolute top-0 left-0 transition-transform duration-75 ease-linear"
            style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              className="drop-shadow-sm"
              aria-hidden="true"
            >
              <path
                d="M1 1L17 7.5L9.5 9.5L7.5 17L1 1Z"
                fill={color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="ml-3 block w-max max-w-48 truncate rounded-md px-1.5 py-0.5 text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              {cardTitle
                ? `${cursor.username} · ${cardTitle}`
                : cursor.username}
            </span>
          </div>
        );
      })}
    </div>
  );
};
