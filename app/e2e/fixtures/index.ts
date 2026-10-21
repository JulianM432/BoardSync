import {
  test as base,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { API_URL, storageStatePath, type UserKey } from "../env.ts";
import { seedBoard, type SeededBoard } from "./seed.ts";

type Fixtures = {
  apiAs: (user: UserKey) => Promise<APIRequestContext>;
  contextAs: (user: UserKey) => Promise<BrowserContext>;
  pageAs: (user: UserKey, path?: string) => Promise<Page>;
  board: SeededBoard;
};

export const test = base.extend<Fixtures>({
  apiAs: async ({ playwright }, use) => {
    const contexts: APIRequestContext[] = [];
    await use(async (user) => {
      const context = await playwright.request.newContext({
        baseURL: `${API_URL}/`,
        storageState: storageStatePath(user),
      });
      contexts.push(context);
      return context;
    });
    await Promise.all(contexts.map((context) => context.dispose()));
  },

  contextAs: async ({ browser }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async (user) => {
      const context = await browser.newContext({
        storageState: storageStatePath(user),
      });
      contexts.push(context);
      return context;
    });
    await Promise.all(contexts.map((context) => context.close()));
  },

  pageAs: async ({ contextAs }, use) => {
    await use(async (user, path = "/") => {
      const context = await contextAs(user);
      const page = await context.newPage();
      await page.goto(path);
      return page;
    });
  },

  board: async ({ apiAs }, use) => {
    const admin = await apiAs("admin");
    const board = await seedBoard(admin);
    await use(board);
    await admin.delete(`boards/${board.id}`);
  },
});

export { expect } from "@playwright/test";
