import { expect, test } from "../fixtures/index.ts";
import { BoardPage } from "../pages/BoardPage.ts";

test.describe("drag & drop de tarjetas", () => {
  test("el editor reordena con el teclado dentro de la columna", async ({
    pageAs,
    board,
  }) => {
    const boardPage = new BoardPage(
      await pageAs("editor", `/boards/${board.id}`),
    );
    const { page } = boardPage;
    await expect(boardPage.cardTitles("Por hacer")).toHaveText([
      "Tarea 1",
      "Tarea 2",
      "Tarea 3",
    ]);

    const moved = boardPage.waitForMove();
    const card = boardPage.draggableCard("Tarea 1");
    await card.focus();
    await page.keyboard.press("Space");
    await expect(card).toHaveAttribute("aria-pressed", "true");
    await boardPage.waitForKeyboardSensor();
    await page.keyboard.press("ArrowDown");
    await expect(boardPage.dndAnnouncements).toContainText("was moved over");
    await page.keyboard.press("Space");
    expect((await moved).ok()).toBe(true);

    const expected = ["Tarea 2", "Tarea 1", "Tarea 3"];
    await expect(boardPage.cardTitles("Por hacer")).toHaveText(expected);
    await page.reload();
    await expect(boardPage.cardTitles("Por hacer")).toHaveText(expected);
  });

  test("el editor mueve una tarjeta a una columna vacía con el mouse", async ({
    pageAs,
    board,
  }) => {
    const boardPage = new BoardPage(
      await pageAs("editor", `/boards/${board.id}`),
    );

    const moved = boardPage.waitForMove();
    await boardPage.dragCard(
      "Tarea 3",
      boardPage.column("Hecho").getByRole("list"),
    );
    expect((await moved).ok()).toBe(true);

    await expect(boardPage.cardTitles("Hecho")).toHaveText(["Tarea 3"]);
    await expect(boardPage.cardTitles("Por hacer")).toHaveText([
      "Tarea 1",
      "Tarea 2",
    ]);
    await boardPage.page.reload();
    await expect(boardPage.cardTitles("Hecho")).toHaveText(["Tarea 3"]);
  });

  test("el editor mueve una tarjeta entre otras de otra columna", async ({
    pageAs,
    apiAs,
    board,
  }) => {
    const admin = await apiAs("admin");
    await admin.post(`boards/${board.id}/cards`, {
      data: { title: "Tarea 4", columnId: board.columns[1]._id },
    });
    const boardPage = new BoardPage(
      await pageAs("editor", `/boards/${board.id}`),
    );

    const moved = boardPage.waitForMove();
    await boardPage.dragCard("Tarea 1", boardPage.draggableCard("Tarea 4"));
    expect((await moved).ok()).toBe(true);

    await expect(boardPage.cardTitles("En curso")).toHaveCount(2);
    await expect(boardPage.cardTitles("Por hacer")).toHaveText([
      "Tarea 2",
      "Tarea 3",
    ]);
    const order = await boardPage.cardTitles("En curso").allTextContents();
    await boardPage.page.reload();
    await expect(boardPage.cardTitles("En curso")).toHaveText(order);
  });

  test("un 409 revierte el movimiento y avisa", async ({ pageAs, board }) => {
    const boardPage = new BoardPage(
      await pageAs("editor", `/boards/${board.id}`),
    );
    const { page } = boardPage;
    await page.route("**/move", (route) =>
      route.fulfill({
        status: 409,
        json: { message: "Stale position, refetch the board" },
      }),
    );

    await boardPage.dragCard(
      "Tarea 1",
      boardPage.column("Hecho").getByRole("list"),
    );

    await expect(
      page.getByText("La tarjeta cambió de lugar, se recargó el board"),
    ).toBeVisible();
    await expect(
      page.getByText("Stale position, refetch the board"),
    ).toHaveCount(0);
    await expect(boardPage.cardTitles("Hecho")).toHaveCount(0);
    await expect(boardPage.cardTitles("Por hacer")).toHaveText([
      "Tarea 1",
      "Tarea 2",
      "Tarea 3",
    ]);
  });

  test("Enter en el botón de opciones abre el menú y no arrastra", async ({
    pageAs,
    board,
  }) => {
    const boardPage = new BoardPage(
      await pageAs("editor", `/boards/${board.id}`),
    );
    const { page } = boardPage;
    await boardPage.cardMenuButton("Tarea 1").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitem", { name: "Editar" })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowDown");

    await expect(boardPage.draggableCard("Tarea 1")).not.toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(boardPage.dndAnnouncements).not.toContainText("Picked up");
    await expect(boardPage.cardTitles("Por hacer")).toHaveText([
      "Tarea 1",
      "Tarea 2",
      "Tarea 3",
    ]);
  });
});
