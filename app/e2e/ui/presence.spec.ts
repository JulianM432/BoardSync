import type { Locator, Page } from "@playwright/test";
import { connected, expect, test } from "../fixtures/realtime.ts";

const connectedUsers = (page: Page) =>
  page.getByRole("list", { name: "Usuarios conectados" });

const cursorOf = (page: Page, username: string) =>
  page.getByLabel(`Cursor de ${username}`);

async function centerOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("No se pudo medir el elemento");
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function contains(container: Locator, inner: Locator) {
  const outer = await container.boundingBox();
  const point = await inner.boundingBox();
  if (!outer || !point) {
    return false;
  }
  return (
    point.x >= outer.x &&
    point.x <= outer.x + outer.width &&
    point.y >= outer.y &&
    point.y <= outer.y + outer.height
  );
}

test.describe("presencia en el board", () => {
  test("los avatares muestran quién está conectado", async ({
    liveBoardAs,
    board,
  }) => {
    const adminBoard = await liveBoardAs("admin", board.id);
    const avatars = connectedUsers(adminBoard.page);
    await expect(
      avatars.getByRole("button", { name: "Admin (vos)" }),
    ).toBeVisible();

    const editorBoard = await liveBoardAs("editor", board.id);
    const viewerBoard = await liveBoardAs("viewer", board.id);
    await expect(avatars.getByRole("button", { name: "Editor" })).toBeVisible();
    await expect(avatars.getByRole("button", { name: "Viewer" })).toBeVisible();
    await expect(
      connectedUsers(viewerBoard.page).getByRole("button", { name: "Admin" }),
    ).toBeVisible();

    await test.step("al irse se borran avatar, cursor y arrastre", async () => {
      await editorBoard.startDrag("Tarea 2");
      const badge = adminBoard.page.getByText("Editor la está moviendo");
      await expect(badge).toBeVisible();
      await expect(cursorOf(adminBoard.page, "Editor")).toBeVisible();

      await editorBoard.page.context().close();
      await expect(avatars.getByRole("button", { name: "Editor" })).toHaveCount(
        0,
      );
      await expect(avatars.getByRole("listitem")).toHaveCount(2);
      await expect(badge).toHaveCount(0);
      await expect(cursorOf(adminBoard.page, "Editor")).toHaveCount(0);
    });
  });

  test("el cursor de otro usuario aparece en el mismo lugar del board", async ({
    liveBoardAs,
    board,
  }) => {
    const adminBoard = await liveBoardAs("admin", board.id);
    const viewerBoard = await liveBoardAs("viewer", board.id);
    const { mouse } = viewerBoard.page;

    const target = await centerOf(viewerBoard.column("En curso"));
    await mouse.move(target.x - 20, target.y - 20);
    await mouse.move(target.x, target.y, { steps: 5 });

    const cursor = cursorOf(adminBoard.page, "Viewer");
    await expect(cursor).toContainText("Viewer");
    await expect
      .poll(() => contains(adminBoard.column("En curso"), cursor))
      .toBe(true);

    await mouse.move(5, 5);
    await expect(cursor).toHaveCount(0);
  });

  test("se ve qué tarjeta está arrastrando otro usuario", async ({
    liveBoardAs,
    board,
  }) => {
    const adminBoard = await liveBoardAs("admin", board.id);
    const editorBoard = await liveBoardAs("editor", board.id);

    await editorBoard.startDrag("Tarea 1");
    await editorBoard.moveMouseTo(
      editorBoard.column("Hecho").getByRole("list"),
    );

    const badge = adminBoard.page.getByText("Editor la está moviendo");
    await expect(
      adminBoard.page
        .locator(`[data-card-id="${board.cards[0]._id}"]`)
        .getByText("Editor la está moviendo"),
    ).toBeVisible();
    await expect(cursorOf(adminBoard.page, "Editor")).toContainText(
      "Editor · Tarea 1",
    );

    const moved = editorBoard.waitForMove();
    await editorBoard.page.mouse.up();
    expect((await moved).ok()).toBe(true);

    await expect(badge).toHaveCount(0);
    await expect(adminBoard.cardTitles("Hecho")).toHaveText(["Tarea 1"]);
    await expect(cursorOf(adminBoard.page, "Editor")).toHaveText("Editor");
  });
});

test.describe("eventos de presencia en el socket", () => {
  test("solo se reenvían entre miembros y con datos válidos", async ({
    socketAs,
    board,
  }) => {
    const editor = await socketAs("editor");
    const viewer = await socketAs("viewer");
    const outsider = await socketAs("outsider");
    await Promise.all([editor, viewer, outsider].map(connected));
    await Promise.all(
      [editor, viewer, outsider].map((socket) =>
        socket.emitWithAck("board:join", board.id),
      ),
    );

    const received: unknown[] = [];
    editor.on("cursor:moved", (payload: unknown) => received.push(payload));
    editor.on("card:dragging", (payload: unknown) => received.push(payload));

    outsider.emit("cursor:move", { boardId: board.id, x: 10, y: 10 });
    outsider.emit("card:drag", { boardId: board.id, cardId: "x" });
    viewer.emit("cursor:move", { boardId: board.id, x: "10", y: 10 });
    viewer.emit("cursor:move", { boardId: board.id, x: -5, y: 10 });
    viewer.emit("cursor:move", { boardId: board.id, x: 40, y: 50 });

    await expect.poll(() => received.length).toBe(1);
    expect(received).toEqual([
      expect.objectContaining({ username: "Viewer", x: 40, y: 50 }),
    ]);
  });
});
