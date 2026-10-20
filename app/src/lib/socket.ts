import { io, type Socket } from "socket.io-client";

export type BoardEventName =
  | "card:created"
  | "card:updated"
  | "card:deleted"
  | "card:moved"
  | "column:created"
  | "column:updated"
  | "column:deleted"
  | "board:updated"
  | "board:deleted";

export type BoardEventPayload = {
  boardId: string;
  actorId: string | null;
};

export type JoinResult = { ok: true } | { ok: false; error: string };

type ServerToClientEvents = Record<
  BoardEventName,
  (payload: BoardEventPayload) => void
> & {
  "boards:changed": () => void;
};

type ClientToServerEvents = {
  "board:join": (boardId: string, ack: (result: JoinResult) => void) => void;
  "board:leave": (boardId: string) => void;
};

const apiOrigin = new URL(import.meta.env.VITE_API_URL).origin;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  apiOrigin,
  {
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket"],
  },
);
