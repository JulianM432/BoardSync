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

export type PresenceUser = {
  userId: string;
  username: string;
};

export type PresencePayload = {
  boardId: string;
  users: PresenceUser[];
};

export type CursorPosition = {
  boardId: string;
  x: number;
  y: number;
};

export type CardDragInput = {
  boardId: string;
  cardId: string | null;
};

export type PeerRef = {
  boardId: string;
  socketId: string;
};

export type PeerIdentity = PeerRef & PresenceUser;

export type ServerToClientEvents = Record<
  BoardEventName,
  (payload: BoardEventPayload) => void
> & {
  "boards:changed": () => void;
  "presence:update": (payload: PresencePayload) => void;
  "cursor:moved": (payload: PeerIdentity & { x: number; y: number }) => void;
  "card:dragging": (payload: PeerIdentity & { cardId: string | null }) => void;
  "cursor:left": (payload: PeerRef) => void;
  "peer:left": (payload: PeerRef) => void;
};

export type ClientToServerEvents = {
  "board:join": (boardId: string, ack: (result: JoinResult) => void) => void;
  "board:leave": (boardId: string) => void;
  "cursor:move": (position: CursorPosition) => void;
  "cursor:leave": (boardId: string) => void;
  "card:drag": (input: CardDragInput) => void;
};

export type SocketData = {
  userId: string;
  username: string;
  role: Role;
};
