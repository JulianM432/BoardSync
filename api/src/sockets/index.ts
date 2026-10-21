import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";
import { requireBoardRole } from "../utils/requireBoardRole.js";
import { AppError } from "../utils/AppError.js";
import { boardRoom, setIo, userRoom } from "./emitter.js";
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
    try {
      const user = verifyToken(token);
      socket.data.userId = user.id;
      socket.data.role = user.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
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
      } catch (error) {
        reply({
          ok: false,
          error: error instanceof AppError ? error.message : "Error interno",
        });
      }
    });

    socket.on("board:leave", (boardId) => {
      if (typeof boardId === "string") {
        void socket.leave(boardRoom(boardId));
      }
    });
  });

  setIo(io);
  return io;
};
