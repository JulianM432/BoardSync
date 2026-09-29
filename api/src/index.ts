import { createServer } from "node:http";
import { createApp } from "./config/app.js";
import { env } from "./config/env.js";
import { connectDb } from "./database/db.js";
import { initSockets } from "./sockets/index.js";

const initApp = async () => {
  await connectDb();
  const app = createApp();
  const server = createServer(app);
  initSockets(server);

  server.listen(env.PORT, () => {
    console.log(`Server started on http://localhost:${env.PORT}`);
  });
};

initApp();
