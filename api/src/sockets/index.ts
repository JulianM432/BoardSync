import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";

const getCookie = (header: string | undefined, name: string) => {
  const prefix = `${name}=`;
  const entry = header
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
};

export const initSockets = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
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
    console.log(`Socket conectado${socket.id} (user: ${socket.data.userId})`);
    socket.on("disconnect", () => {
      console.log(`Socket desconectado (user: ${socket.id})`);
    });
  });
  return io;
};
