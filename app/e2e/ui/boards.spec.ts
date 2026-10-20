import { expect, test } from "../fixtures/index.ts";
import { uniqueName } from "../fixtures/seed.ts";
import { AppShell } from "../pages/AppShell.ts";
import { BoardPage } from "../pages/BoardPage.ts";

test.describe("columnas", () => {
  test("el owner crea, renombra y borra una columna", async ({
    pageAs,
    board,
  }) => {
    const boardPage = new BoardPage(
      await pageAs("admin", `/boards/${board.id}`),
    );

    await test.step("crear", async () => {
      const dialog = await boardPage.addColumn("Revisión");
      await expect(dialog).toBeHidden();
      await expect(boardPage.column("Revisión")).toBeVisible();
    });

    await test.step("renombrar", async () => {
      await boardPage.renameColumn("Revisión", "QA");
      await expect(boardPage.column("QA")).toBeVisible();
    });

    await test.step("borrar", async () => {
      await boardPage.deleteColumn("QA");
      await expect(boardPage.column("QA")).toHaveCount(0);
    });
  });
});

test.describe("tarjetas", () => {
  test("el editor crea, edita y borra una tarjeta", async ({
    pageAs,
    board,
  }) => {
    const boardPage = new BoardPage(
      await pageAs("editor", `/boards/${board.id}`),
    );

    await test.step("crear con descripción y asignado", async () => {
      const dialog = await boardPage.addCard("En curso", {
        title: "Tarjeta e2e",
        description: "Creada por Playwright",
        assignee: board.users.viewer.username,
      });
      await expect(dialog).toBeHidden();
      const card = boardPage.card("Tarjeta e2e");
      await expect(card).toContainText("Creada por Playwright");
      await expect(card).toContainText(
        `Asignada a: ${board.users.viewer.username}`,
      );
      await expect(card).toContainText(
        `Creada por: ${board.users.editor.username}`,
      );
    });

    await test.step("editar el título", async () => {
      const dialog = await boardPage.openEditCardDialog("Tarjeta e2e");
      const save = dialog.getByRole("button", { name: "Guardar" });
      await expect(save).toBeDisabled();
      await dialog.getByLabel("Título").fill("Tarjeta editada");
      await save.click();
      await expect(dialog).toBeHidden();
      await expect(boardPage.cardTitles("En curso")).toHaveText([
        "Tarjeta editada",
      ]);
    });

    await test.step("borrar", async () => {
      await boardPage.deleteCard("Tarjeta editada");
      await expect(boardPage.cardTitles("En curso")).toHaveCount(0);
    });
  });

  test("el título es obligatorio", async ({ pageAs, board }) => {
    const boardPage = new BoardPage(
      await pageAs("editor", `/boards/${board.id}`),
    );
    const dialog = await boardPage.addCard("Hecho", { title: "   " });
    await expect(dialog.getByRole("alert")).toHaveText(
      "El título es obligatorio",
    );
  });
});

test.describe("boards", () => {
  test("el owner quita un miembro del board", async ({
    pageAs,
    apiAs,
    board,
  }) => {
    const boardPage = new BoardPage(
      await pageAs("admin", `/boards/${board.id}`),
    );
    await boardPage.chooseMenuItem(
      boardPage.boardMenuButton(board.name),
      "Editar",
    );
    const dialog = boardPage.dialog("Editar board");
    await dialog
      .getByRole("button", { name: `Quitar a ${board.users.viewer.username}` })
      .click();
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog).toBeHidden();

    const admin = await apiAs("admin");
    const updated: { members: { userId: { _id: string } }[] } = await (
      await admin.get(`boards/${board.id}`)
    ).json();
    expect(updated.members.map((member) => member.userId._id)).toEqual([
      board.users.editor._id,
    ]);
  });

  test("un nombre duplicado muestra un toast y deja el dialog abierto", async ({
    pageAs,
    board,
  }) => {
    const shell = new AppShell(await pageAs("admin"));
    await shell.createBoard(board.name);
    await expect(shell.toast("Ya existe este nombre")).toBeVisible();
    await expect(shell.boardDialog).toBeVisible();
  });

  test("el admin crea y borra un board", async ({ pageAs }) => {
    const page = await pageAs("admin");
    const shell = new AppShell(page);
    const boardPage = new BoardPage(page);
    const name = uniqueName("ui");

    await shell.createBoard(name);
    await expect(boardPage.heading).toHaveText(name);
    await expect(shell.boardLink(name)).toBeVisible();

    await boardPage.deleteBoard(name);
    await expect(shell.emptyState).toBeVisible();
    await expect(shell.boardLink(name)).toHaveCount(0);
  });
});
