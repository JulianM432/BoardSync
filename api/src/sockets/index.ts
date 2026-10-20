import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";
import { requireBoardRole } from "../utils/requireBoardRole.js";
import { AppError } from "../utils/AppError.js";
import { UserModel } from "../models/user.js";
import {
  announceLeave,
  boardRoom,
  broadcastPresence,
  setIo,
  userRoom,
} from "./emitter.js";
import { registerPresenceHandlers } from "./presence.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./events.js";

const getCookie = (header: string | undefined, name: string) => {
  const prefix = `${name}=`;
  const entry = header
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
};

export const initSockets = (httpServer: HttpServer) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = getCookie(socket.handshake.headers.cookie, "token");
    if (!token) {
      return next(new Error("No token provided"));
    }
    let user;
    try {
      user = verifyToken(token);
    } catch {
      return next(new Error("Invalid token"));
    }
    UserModel.findById(user.id)
      .select("username")
      .then((account) => {
        if (!account) {
          return next(new Error("User not found"));
        }
        socket.data.userId = user.id;
        socket.data.username = account.username;
        socket.data.role = user.role;
        next();
      })
      .catch(() => next(new Error("User not found")));
  });

  io.on("connection", (socket) => {
    void socket.join(userRoom(socket.data.userId));

    socket.on("board:join", async (boardId, ack) => {
      const reply = typeof ack === "function" ? ack : () => undefined;
      if (typeof boardId !== "string") {
        reply({ ok: false, error: "boardId invalid" });
        return;
      }
      try {
        await requireBoardRole(boardId, {
          id: socket.data.userId,
          role: socket.data.role,
        });
        await socket.join(boardRoom(boardId));
        reply({ ok: true });
        await broadcastPresence(boardId);
      } catch (error) {
        reply({
          ok: false,
          error: error instanceof AppError ? error.message : "Error interno",
        });
      }
    });

    socket.on("board:leave", (boardId) => {
      if (typeof boardId === "string" && socket.rooms.has(boardRoom(boardId))) {
        void socket.leave(boardRoom(boardId));
        announceLeave(boardId, socket.id);
      }
    });

    registerPresenceHandlers(socket);
  });

  setIo(io);
  return io;
};
