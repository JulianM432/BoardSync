import type { Socket } from "socket.io";
import { z } from "zod";
import { announceLeave, boardRoom } from "./emitter.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./events.js";

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

const MAX_COORDINATE = 100_000;

const coordinate = z.number().finite().min(0).max(MAX_COORDINATE);

const cursorSchema = z.object({
  boardId: z.string(),
  x: coordinate,
  y: coordinate,
});

const dragSchema = z.object({
  boardId: z.string(),
  cardId: z.string().max(64).nullable(),
});

const BOARD_ROOM_PREFIX = boardRoom("");

export function registerPresenceHandlers(socket: AppSocket) {
  const isInBoard = (boardId: unknown): boardId is string =>
    typeof boardId === "string" && socket.rooms.has(boardRoom(boardId));

  const identity = (boardId: string) => ({
    boardId,
    socketId: socket.id,
    userId: socket.data.userId,
    username: socket.data.username,
  });

  socket.on("cursor:move", (input: unknown) => {
    const parsed = cursorSchema.safeParse(input);
    if (!parsed.success || !isInBoard(parsed.data.boardId)) {
      return;
    }
    const { boardId, x, y } = parsed.data;
    socket.volatile
      .to(boardRoom(boardId))
      .emit("cursor:moved", { ...identity(boardId), x, y });
  });

  socket.on("cursor:leave", (boardId: unknown) => {
    if (isInBoard(boardId)) {
      socket
        .to(boardRoom(boardId))
        .emit("cursor:left", { boardId, socketId: socket.id });
    }
  });

  socket.on("card:drag", (input: unknown) => {
    const parsed = dragSchema.safeParse(input);
    if (!parsed.success || !isInBoard(parsed.data.boardId)) {
      return;
    }
    const { boardId, cardId } = parsed.data;
    socket
      .to(boardRoom(boardId))
      .emit("card:dragging", { ...identity(boardId), cardId });
  });

  let joinedBoards: string[] = [];

  socket.on("disconnecting", () => {
    joinedBoards = [...socket.rooms]
      .filter((room) => room.startsWith(BOARD_ROOM_PREFIX))
      .map((room) => room.slice(BOARD_ROOM_PREFIX.length));
  });

  socket.on("disconnect", () => {
    for (const boardId of joinedBoards) {
      announceLeave(boardId, socket.id);
    }
  });
}
