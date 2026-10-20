import { useEffect, useState } from "react";
import {
  socket,
  type CardDragPayload,
  type PeerRef,
  type PresencePayload,
  type PresenceUser,
} from "@/lib/socket";

export type RemoteDrag = Omit<CardDragPayload, "cardId"> & { cardId: string };

type PresenceState = {
  boardId: string;
  users: PresenceUser[];
  drags: Record<string, RemoteDrag>;
};

const withoutKey = <T>(record: Record<string, T>, key: string) =>
  Object.fromEntries(
    Object.entries(record).filter(([entryKey]) => entryKey !== key),
  );

export function useBoardPresence(boardId: string) {
  const [state, setState] = useState<PresenceState>({
    boardId,
    users: [],
    drags: {},
  });

  useEffect(() => {
    const update = (
      recipe: (prev: PresenceState) => PresenceState,
      payloadBoardId: string,
    ) => {
      if (payloadBoardId !== boardId) {
        return;
      }
      setState((prev) =>
        recipe(
          prev.boardId === boardId ? prev : { boardId, users: [], drags: {} },
        ),
      );
    };

    const onPresence = (payload: PresencePayload) => {
      update((prev) => ({ ...prev, users: payload.users }), payload.boardId);
    };

    const onDragging = ({ cardId, ...peer }: CardDragPayload) => {
      update(
        (prev) => ({
          ...prev,
          drags:
            cardId === null
              ? withoutKey(prev.drags, peer.socketId)
              : { ...prev.drags, [peer.socketId]: { ...peer, cardId } },
        }),
        peer.boardId,
      );
    };

    const onPeerLeft = (payload: PeerRef) => {
      update(
        (prev) => ({
          ...prev,
          drags: withoutKey(prev.drags, payload.socketId),
        }),
        payload.boardId,
      );
    };

    const onDisconnect = () => {
      setState({ boardId, users: [], drags: {} });
    };

    socket.on("presence:update", onPresence);
    socket.on("card:dragging", onDragging);
    socket.on("peer:left", onPeerLeft);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("presence:update", onPresence);
      socket.off("card:dragging", onDragging);
      socket.off("peer:left", onPeerLeft);
      socket.off("disconnect", onDisconnect);
    };
  }, [boardId]);

  const current = state.boardId === boardId ? state : { users: [], drags: {} };
  return { users: current.users, drags: Object.values(current.drags) };
}
