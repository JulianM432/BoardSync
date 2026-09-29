import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";

export const initSockets = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error("No token provided"));
    }
    try {
      const payload = verifyToken(token);
      socket.data.userId = payload.id;
      socket.data.role = payload.role;
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
