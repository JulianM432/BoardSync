import type { Request } from "express";
import type { Server } from "socket.io";
import type {
  BoardEventName,
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./events.js";

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

let io: AppServer | null = null;

export const setIo = (server: AppServer) => {
  io = server;
};

export const boardRoom = (boardId: string) => `board:${boardId}`;
export const userRoom = (userId: string) => `user:${userId}`;

export function emitToBoard(
  req: Request,
  boardId: string,
  event: BoardEventName,
) {
  if (!io) {
    return;
  }
  const room = io.to(boardRoom(boardId));
  const socketId = req.get("x-socket-id");
  const target = socketId ? room.except(socketId) : room;
  target.emit(event, { boardId, actorId: req.user?.id ?? null });
}

export function notifyBoardsChanged(userIds: string[]) {
  if (!io || userIds.length === 0) {
    return;
  }
  io.to(userIds.map(userRoom)).emit("boards:changed");
}

export async function removeNonMembers(boardId: string, userIds: string[]) {
  if (!io) {
    return;
  }
  const allowed = new Set(userIds);
  const sockets = await io.in(boardRoom(boardId)).fetchSockets();
  for (const socket of sockets) {
    if (!allowed.has(socket.data.userId)) {
      socket.leave(boardRoom(boardId));
    }
  }
}
