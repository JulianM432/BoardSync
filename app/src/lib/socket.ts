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

export type PresenceUser = {
  userId: string;
  username: string;
};

export type PresencePayload = {
  boardId: string;
  users: PresenceUser[];
};

export type PeerRef = {
  boardId: string;
  socketId: string;
};

export type PeerIdentity = PeerRef & PresenceUser;

export type CursorPayload = PeerIdentity & { x: number; y: number };

export type CardDragPayload = PeerIdentity & { cardId: string | null };

type ServerToClientEvents = Record<
  BoardEventName,
  (payload: BoardEventPayload) => void
> & {
  "boards:changed": () => void;
  "presence:update": (payload: PresencePayload) => void;
  "cursor:moved": (payload: CursorPayload) => void;
  "cursor:left": (payload: PeerRef) => void;
  "card:dragging": (payload: CardDragPayload) => void;
  "peer:left": (payload: PeerRef) => void;
};

type ClientToServerEvents = {
  "board:join": (boardId: string, ack: (result: JoinResult) => void) => void;
  "board:leave": (boardId: string) => void;
  "cursor:move": (position: { boardId: string; x: number; y: number }) => void;
  "cursor:leave": (boardId: string) => void;
  "card:drag": (input: { boardId: string; cardId: string | null }) => void;
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
