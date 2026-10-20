import { expect, test } from "../fixtures/index.ts";
import { AppShell } from "../pages/AppShell.ts";
import { BoardPage } from "../pages/BoardPage.ts";

test.describe("la UI muestra solo las acciones del rol", () => {
  test("el owner ve todas las acciones", async ({ pageAs, board }) => {
    const boardPage = new BoardPage(
      await pageAs("admin", `/boards/${board.id}`),
    );
    await expect(boardPage.roleBadge("Owner")).toBeVisible();
    await expect(boardPage.boardMenuButton(board.name)).toBeVisible();
    await expect(boardPage.addColumnButton).toBeVisible();
    await expect(boardPage.columnMenuButton("Por hacer")).toBeVisible();
    await expect(boardPage.cardMenuButton("Tarea 1")).toBeVisible();
    await expect(boardPage.addCardButtons).toHaveCount(3);
  });

  test("el editor solo maneja tarjetas", async ({ pageAs, board }) => {
    const boardPage = new BoardPage(
      await pageAs("editor", `/boards/${board.id}`),
    );
    await expect(boardPage.roleBadge("Editor")).toBeVisible();
    await expect(boardPage.cardMenuButton("Tarea 1")).toBeVisible();
    await expect(boardPage.addCardButtons).toHaveCount(3);
    await expect(boardPage.boardMenuButton(board.name)).toHaveCount(0);
    await expect(boardPage.addColumnButton).toHaveCount(0);
    await expect(boardPage.columnMenuButton("Por hacer")).toHaveCount(0);
  });

  test("el viewer no ve acciones de escritura", async ({ pageAs, board }) => {
    const page = await pageAs("viewer", `/boards/${board.id}`);
    const boardPage = new BoardPage(page);
    await expect(boardPage.roleBadge("Viewer · solo lectura")).toBeVisible();
    await expect(boardPage.card("Tarea 1")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Opciones/ })).toHaveCount(
      0,
    );
    await expect(page.getByRole("button", { name: /^Agregar/ })).toHaveCount(0);
    await expect(page.locator("[aria-roledescription=sortable]")).toHaveCount(
      0,
    );
  });

  test("solo un admin ve el botón de nuevo board", async ({ pageAs }) => {
    const admin = new AppShell(await pageAs("admin"));
    await expect(admin.newBoardButton).toBeVisible();

    const editor = new AppShell(await pageAs("editor"));
    await expect(editor.emptyState).toBeVisible();
    await expect(editor.newBoardButton).toHaveCount(0);
  });
});
