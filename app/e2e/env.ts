export const API_PORT = 5001;
export const APP_PORT = 5174;
export const MONGO_PORT = 27018;

export const API_URL = `http://localhost:${API_PORT}/api`;
export const APP_URL = `http://localhost:${APP_PORT}`;
export const MONGO_URI = `mongodb://localhost:${MONGO_PORT}/kanban_e2e`;

export const PASSWORD = "E2e-Password1!";

export const USERS = {
  admin: { email: "admin@e2e.test", username: "Admin", role: "admin" },
  editor: { email: "editor@e2e.test", username: "Editor", role: "user" },
  viewer: { email: "viewer@e2e.test", username: "Viewer", role: "user" },
  outsider: { email: "outsider@e2e.test", username: "Outsider", role: "user" },
} as const;

export type UserKey = keyof typeof USERS;

export const USER_KEYS = Object.keys(USERS).filter((key): key is UserKey =>
  Object.hasOwn(USERS, key),
);

export const storageStatePath = (user: UserKey) => `e2e/.auth/${user}.json`;
