import { readFile } from "node:fs/promises";
import type { Page } from "@playwright/test";
import { io, type Socket } from "socket.io-client";
import { API_URL, storageStatePath, type UserKey } from "../env.ts";
import { BoardPage } from "../pages/BoardPage.ts";
import { test as base } from "./index.ts";

type RealtimeFixtures = {
  liveBoardAs: (user: UserKey, boardId: string) => Promise<BoardPage>;
  socketAs: (user?: UserKey) => Promise<Socket>;
};

const SOCKET_CONNECTED = /^40\{"sid":/;
const JOIN_ACCEPTED = /^43\d+\[\{"ok":true\}\]$/;

function waitForSocketFrame(page: Page, pattern: RegExp) {
  return new Promise<void>((resolve) => {
    page.once("websocket", (socket) => {
      const onFrame = ({ payload }: { payload: string | Buffer }) => {
        if (typeof payload === "string" && pattern.test(payload)) {
          socket.off("framereceived", onFrame);
          resolve();
        }
      };
      socket.on("framereceived", onFrame);
    });
  });
}

export const waitForSocketConnected = (page: Page) =>
  waitForSocketFrame(page, SOCKET_CONNECTED);

async function sessionToken(user: UserKey) {
  const state: { cookies: { name: string; value: string }[] } = JSON.parse(
    await readFile(storageStatePath(user), "utf8"),
  );
  const token = state.cookies.find((cookie) => cookie.name === "token");
  if (!token) {
    throw new Error(`Sin cookie de sesión para ${user}`);
  }
  return token.value;
}

export const test = base.extend<RealtimeFixtures>({
  liveBoardAs: async ({ contextAs }, use) => {
    await use(async (user, boardId) => {
      const page = await (await contextAs(user)).newPage();
      const joined = waitForSocketFrame(page, JOIN_ACCEPTED);
      await page.goto(`/boards/${boardId}`);
      await joined;
      return new BoardPage(page);
    });
  },

  socketAs: async ({}, use) => {
    const sockets: Socket[] = [];
    await use(async (user) => {
      const socket = io(new URL(API_URL).origin, {
        transports: ["websocket"],
        extraHeaders: user
          ? { cookie: `token=${await sessionToken(user)}` }
          : {},
        reconnection: false,
      });
      sockets.push(socket);
      return socket;
    });
    for (const socket of sockets) {
      socket.close();
    }
  },
});

export const connected = (socket: Socket) =>
  new Promise<void>((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }
    socket.on("connect", () => resolve());
    socket.on("connect_error", reject);
  });

export const connectionError = (socket: Socket) =>
  new Promise<Error>((resolve) => {
    socket.on("connect_error", resolve);
  });

export { expect } from "@playwright/test";
