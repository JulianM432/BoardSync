import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Conectado a MongoDB");
    
    mongoose.connection.on("connected", () => {
      console.log("MongoDB conectado");
    });
    mongoose.connection.on("error", (err) => {
      console.error("Error de conexión a MongoDB", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB desconectado");
    });
  } catch (error) {
    if (error instanceof mongoose.Error) {
      console.error("Error al conectar MongoDB:", error.message);
      process.exit(1);
    }
  }
};

export const getMongoStatus = (): "connected" | "disconnected" => {
  return mongoose.connection.readyState === 1 ? "connected" : "disconnected";
};
