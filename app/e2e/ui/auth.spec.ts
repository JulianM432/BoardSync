import { PASSWORD, USERS } from "../env.ts";
import { expect, test } from "../fixtures/index.ts";
import { AppShell } from "../pages/AppShell.ts";
import { BoardPage } from "../pages/BoardPage.ts";
import { LoginPage } from "../pages/LoginPage.ts";

test.describe("autenticación", () => {
  test("login y logout desde la UI", async ({ page }) => {
    const login = new LoginPage(page);
    const shell = new AppShell(page);

    await login.goto();
    await login.login(USERS.editor.email, PASSWORD);
    await expect(shell.emptyState).toBeVisible();

    await shell.logoutButton.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("un password incorrecto muestra el error", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.editor.email, "Incorrecta123!");
    await expect(login.error).toHaveText("Credenciales inválidas");
  });

  test("una ruta protegida sin sesión redirige al login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("un usuario ajeno ve el board como no encontrado", async ({
    pageAs,
    board,
  }) => {
    const page = await pageAs("outsider", `/boards/${board.id}`);
    await expect(new BoardPage(page).notFound).toBeVisible();
  });
});
