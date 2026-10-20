import {
  connected,
  connectionError,
  expect,
  test,
  waitForSocketConnected,
} from "../fixtures/realtime.ts";
import { AppShell } from "../pages/AppShell.ts";

test.describe("cambios en tiempo real", () => {
  test("los cambios de tarjetas llegan a otro usuario sin recargar", async ({
    liveBoardAs,
    apiAs,
    board,
  }) => {
    const adminBoard = await liveBoardAs("admin", board.id);
    const editorBoard = await liveBoardAs("editor", board.id);

    await test.step("crear desde la UI", async () => {
      await adminBoard.addCard("En curso", { title: "En vivo" });
      await expect(editorBoard.cardTitles("En curso")).toHaveText(["En vivo"]);
    });

    await test.step("editar", async () => {
      const editor = await apiAs("editor");
      await editor.patch(`boards/${board.id}/cards/${board.cards[0]._id}`, {
        data: { title: "Editada por el editor" },
      });
      await expect(adminBoard.cardTitles("Por hacer").first()).toHaveText(
        "Editada por el editor",
      );
    });

    const admin = await apiAs("admin");

    await test.step("mover", async () => {
      await admin.patch(`boards/${board.id}/cards/${board.cards[1]._id}/move`, {
        data: { columnId: board.columns[2]._id, prevId: null, nextId: null },
      });
      await expect(editorBoard.cardTitles("Hecho")).toHaveText(["Tarea 2"]);
    });

    await test.step("borrar", async () => {
      await admin.delete(`boards/${board.id}/cards/${board.cards[2]._id}`);
      await expect(editorBoard.cardTitles("Por hacer")).toHaveText([
        "Editada por el editor",
      ]);
    });
  });

  test("los cambios de columnas llegan a otro usuario", async ({
    liveBoardAs,
    apiAs,
    board,
  }) => {
    const editorBoard = await liveBoardAs("editor", board.id);
    const admin = await apiAs("admin");

    await admin.post(`boards/${board.id}/columns`, { data: { name: "Nueva" } });
    await expect(editorBoard.column("Nueva")).toBeVisible();

    await admin.patch(`boards/${board.id}/columns/${board.columns[2]._id}`, {
      data: { name: "Terminado" },
    });
    await expect(editorBoard.column("Terminado")).toBeVisible();

    await admin.delete(`boards/${board.id}/columns/${board.columns[0]._id}`);
    await expect(editorBoard.column("Por hacer")).toHaveCount(0);
    await expect(editorBoard.card("Tarea 1")).toHaveCount(0);
  });

  test("renombrar el board se ve en el header y en la sidebar", async ({
    liveBoardAs,
    apiAs,
    board,
  }) => {
    const editorBoard = await liveBoardAs("editor", board.id);
    const shell = new AppShell(editorBoard.page);
    const name = `${board.name}-renombrado`;

    await (
      await apiAs("admin")
    ).patch(`boards/${board.id}`, {
      data: { name },
    });
    await expect(editorBoard.heading).toHaveText(name);
    await expect(shell.boardLink(name)).toBeVisible();
  });
});

test.describe("membresía en tiempo real", () => {
  test("un miembro quitado sale de la página con un aviso", async ({
    liveBoardAs,
    apiAs,
    board,
  }) => {
    const viewerBoard = await liveBoardAs("viewer", board.id);
    const shell = new AppShell(viewerBoard.page);

    await (
      await apiAs("admin")
    ).patch(`boards/${board.id}`, {
      data: { members: [{ userId: board.users.editor._id, role: "editor" }] },
    });
    await expect(shell.toast("Ya no tenés acceso a este board")).toBeVisible();
    await expect(shell.emptyState).toBeVisible();
    await expect(shell.boardLink(board.name)).toHaveCount(0);
  });

  test("un usuario agregado ve el board en su sidebar", async ({
    contextAs,
    apiAs,
    board,
  }) => {
    const page = await (await contextAs("outsider")).newPage();
    const shell = new AppShell(page);
    const socketReady = waitForSocketConnected(page);
    await page.goto("/");
    await socketReady;
    await expect(shell.boardLink(board.name)).toHaveCount(0);

    await (
      await apiAs("admin")
    ).patch(`boards/${board.id}`, {
      data: {
        members: [
          { userId: board.users.editor._id, role: "editor" },
          { userId: board.users.viewer._id, role: "viewer" },
          { userId: board.users.outsider._id, role: "viewer" },
        ],
      },
    });
    await expect(shell.boardLink(board.name)).toBeVisible();
  });

  test("borrar el board saca a los demás usuarios", async ({
    liveBoardAs,
    apiAs,
    board,
  }) => {
    const editorBoard = await liveBoardAs("editor", board.id);
    const shell = new AppShell(editorBoard.page);

    await (await apiAs("admin")).delete(`boards/${board.id}`);
    await expect(shell.toast("El board fue eliminado")).toBeVisible();
    await expect(shell.emptyState).toBeVisible();
    await expect(shell.boardLink(board.name)).toHaveCount(0);
  });
});

test.describe("seguridad del socket", () => {
  test("sin cookie la conexión se rechaza", async ({ socketAs }) => {
    const error = await connectionError(await socketAs());
    expect(error.message).toBe("No token provided");
  });

  test("solo los miembros pueden unirse al room del board", async ({
    socketAs,
    board,
  }) => {
    for (const [user, allowed] of [
      ["editor", true],
      ["viewer", true],
      ["outsider", false],
    ] as const) {
      const socket = await socketAs(user);
      await connected(socket);
      const result: { ok: boolean } = await socket.emitWithAck(
        "board:join",
        board.id,
      );
      expect(result.ok, user).toBe(allowed);
    }
  });

  test("un miembro quitado deja de recibir eventos del board", async ({
    socketAs,
    apiAs,
    board,
  }) => {
    const editor = await socketAs("editor");
    const viewer = await socketAs("viewer");
    await Promise.all([connected(editor), connected(viewer)]);
    await editor.emitWithAck("board:join", board.id);
    await viewer.emitWithAck("board:join", board.id);

    const admin = await apiAs("admin");
    await admin.patch(`boards/${board.id}`, {
      data: { members: [{ userId: board.users.editor._id, role: "editor" }] },
    });

    const viewerEvents: string[] = [];
    viewer.onAny((event: string) => viewerEvents.push(event));
    const editorReceived = new Promise<void>((resolve) => {
      editor.on("card:created", () => resolve());
    });
    await admin.post(`boards/${board.id}/cards`, {
      data: { title: "Secreta", columnId: board.columns[0]._id },
    });
    await editorReceived;
    expect(viewerEvents).not.toContain("card:created");
  });
});

test.describe("drag & drop con cambios remotos", () => {
  test("un cambio remoto durante el arrastre no lo interrumpe", async ({
    liveBoardAs,
    apiAs,
    board,
  }) => {
    const editorBoard = await liveBoardAs("editor", board.id);
    const { page } = editorBoard;
    const draggedCopies = page.getByText("Tarea 1", { exact: true });

    await editorBoard.startDrag("Tarea 1");
    await editorBoard.moveMouseTo(
      editorBoard.column("Hecho").getByRole("list"),
    );
    await expect(draggedCopies).toHaveCount(2);
    await expect(editorBoard.cardTitles("Hecho")).toHaveText(["Tarea 1"]);

    const refetched = page.waitForResponse(
      (response) =>
        response.url().endsWith("/cards") &&
        response.request().method() === "GET",
    );
    await (
      await apiAs("admin")
    ).post(`boards/${board.id}/cards`, {
      data: { title: "Remota", columnId: board.columns[1]._id },
    });
    await refetched;
    await expect(draggedCopies).toHaveCount(2);
    await expect(editorBoard.cardTitles("Hecho")).toHaveText(["Tarea 1"]);

    const moved = editorBoard.waitForMove();
    await page.mouse.up();
    expect((await moved).ok()).toBe(true);
    await expect(editorBoard.cardTitles("Hecho")).toHaveText(["Tarea 1"]);
    await expect(editorBoard.cardTitles("En curso")).toHaveText(["Remota"]);
  });
});
