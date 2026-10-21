import { expect, test as setup } from "@playwright/test";
import {
  API_URL,
  PASSWORD,
  storageStatePath,
  USER_KEYS,
  USERS,
} from "../env.ts";

for (const user of USER_KEYS) {
  setup(`sesión de ${user}`, async ({ playwright }) => {
    const api = await playwright.request.newContext({
      baseURL: `${API_URL}/`,
    });
    const response = await api.post("auth/login", {
      data: { email: USERS[user].email, password: PASSWORD },
    });
    expect(response.ok()).toBe(true);
    await api.storageState({ path: storageStatePath(user) });
    await api.dispose();
  });
}
