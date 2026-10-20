import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";
import {
  API_PORT,
  API_URL,
  APP_PORT,
  APP_URL,
  MONGO_URI,
  PASSWORD,
  USERS,
} from "./e2e/env.ts";

if (existsSync("e2e/.env")) {
  process.loadEnvFile("e2e/.env");
}

const isCI = Boolean(process.env.CI);
const browserLibs = process.env.E2E_BROWSER_LIBS;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: APP_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: browserLibs
      ? { env: { ...process.env, LD_LIBRARY_PATH: browserLibs } }
      : {},
  },
  projects: [
    { name: "setup", testMatch: /setup\/.*\.setup\.ts/ },
    {
      name: "api",
      testMatch: /api\/.*\.spec\.ts/,
      dependencies: ["setup"],
      use: { baseURL: `${API_URL}/` },
    },
    {
      name: "chromium",
      testMatch: /ui\/.*\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      name: "API",
      cwd: "../api",
      command:
        "./node_modules/.bin/tsx src/scripts/seed-e2e.ts && exec ./node_modules/.bin/tsx src/index.ts",
      url: `${API_URL}/health`,
      reuseExistingServer: false,
      env: {
        PORT: String(API_PORT),
        MONGO_URI,
        JWT_SECRET: "e2e-jwt-secret-only-for-tests",
        FRONTEND_URL: APP_URL,
        E2E_PASSWORD: PASSWORD,
        E2E_USERS: JSON.stringify(Object.values(USERS)),
      },
    },
    {
      name: "App",
      command: `./node_modules/.bin/vite build --outDir node_modules/.e2e-dist && exec ./node_modules/.bin/vite preview --outDir node_modules/.e2e-dist --port ${APP_PORT} --strictPort`,
      url: APP_URL,
      reuseExistingServer: false,
      env: { VITE_API_URL: API_URL },
    },
  ],
});
