import type { Role } from "../config/permissions.js";

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

export type ServerToClientEvents = Record<
  BoardEventName,
  (payload: BoardEventPayload) => void
> & {
  "boards:changed": () => void;
};

export type ClientToServerEvents = {
  "board:join": (boardId: string, ack: (result: JoinResult) => void) => void;
  "board:leave": (boardId: string) => void;
};

export type SocketData = {
  userId: string;
  role: Role;
};
