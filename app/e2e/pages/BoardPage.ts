import type { Locator, Page } from "@playwright/test";

type NewCard = {
  title: string;
  description?: string;
  assignee?: string;
};

export class BoardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }

  get notFound() {
    return this.page.getByText("El board no existe o no tenés acceso.");
  }

  get addColumnButton() {
    return this.page.getByRole("button", {
      name: "Agregar columna",
    });
  }

  get addCardButtons() {
    return this.page.getByRole("button", {
      name: "Agregar tarjeta",
    });
  }

  get confirmDeleteButton() {
    return this.page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Eliminar" });
  }

  roleBadge(text: string) {
    return this.page
      .getByRole("main")
      .locator("header")
      .getByText(text, { exact: true });
  }

  column(name: string) {
    return this.page.getByRole("region", { name });
  }

  cardTitles(column: string) {
    return this.column(column).locator("[data-slot=card-title]");
  }

  card(title: string) {
    return this.page.locator("[data-slot=card]", {
      has: this.page.getByText(title, { exact: true }),
    });
  }

  draggableCard(title: string) {
    return this.page.getByRole("button", {
      name: `Tarjeta ${title}`,
      exact: true,
    });
  }

  cardMenuButton(title: string) {
    return this.page.getByRole("button", { name: `Opciones de ${title}` });
  }

  columnMenuButton(name: string) {
    return this.page.getByRole("button", {
      name: `Opciones de la columna ${name}`,
    });
  }

  boardMenuButton(name: string) {
    return this.page.getByRole("button", {
      name: `Opciones del board ${name}`,
    });
  }

  dialog(name: string) {
    return this.page.getByRole("dialog", { name });
  }

  async chooseMenuItem(trigger: Locator, item: string) {
    await trigger.click();
    await this.page.getByRole("menuitem", { name: item }).click();
  }

  async addColumn(name: string) {
    await this.addColumnButton.click();
    const dialog = this.dialog("Nueva columna");
    await dialog.getByLabel("Nombre").fill(name);
    await dialog.getByRole("button", { name: "Crear" }).click();
    return dialog;
  }

  async renameColumn(name: string, newName: string) {
    await this.chooseMenuItem(this.columnMenuButton(name), "Renombrar");
    const dialog = this.dialog("Renombrar columna");
    await dialog.getByLabel("Nombre").fill(newName);
    await dialog.getByRole("button", { name: "Guardar" }).click();
  }

  async deleteColumn(name: string) {
    await this.chooseMenuItem(this.columnMenuButton(name), "Eliminar");
    await this.confirmDeleteButton.click();
  }

  async openNewCardDialog(column: string) {
    await this.column(column)
      .getByRole("button", { name: "Agregar tarjeta" })
      .click();
    return this.dialog("Nueva tarjeta");
  }

  async addCard(column: string, card: NewCard) {
    const dialog = await this.openNewCardDialog(column);
    await dialog.getByLabel("Título").fill(card.title);
    if (card.description) {
      await dialog.getByLabel("Descripción").fill(card.description);
    }
    if (card.assignee) {
      await dialog.getByLabel("Asignada a").click();
      await this.page.getByRole("option", { name: card.assignee }).click();
    }
    await dialog.getByRole("button", { name: "Crear" }).click();
    return dialog;
  }

  async openEditCardDialog(title: string) {
    await this.chooseMenuItem(this.cardMenuButton(title), "Editar");
    return this.dialog("Editar tarjeta");
  }

  async deleteCard(title: string) {
    await this.chooseMenuItem(this.cardMenuButton(title), "Eliminar");
    await this.confirmDeleteButton.click();
  }

  async deleteBoard(name: string) {
    await this.chooseMenuItem(this.boardMenuButton(name), "Eliminar");
    await this.confirmDeleteButton.click();
  }

  async dragCard(title: string, target: Locator) {
    await this.startDrag(title);
    await this.moveMouseTo(target);
    await this.page.mouse.up();
  }

  async startDrag(title: string) {
    const from = await this.boxOf(this.draggableCard(title));
    await this.page.mouse.move(from.x, from.y);
    await this.page.mouse.down();
    await this.page.mouse.move(from.x + 10, from.y + 10, { steps: 5 });
  }

  async moveMouseTo(target: Locator) {
    const to = await this.boxOf(target);
    await this.page.mouse.move(to.x, to.y, { steps: 15 });
  }

  get dndAnnouncements() {
    return this.page.locator("[id^=DndLiveRegion]");
  }

  async waitForKeyboardSensor() {
    await this.page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 0)),
    );
  }

  waitForMove() {
    return this.page.waitForResponse(
      (response) =>
        response.url().endsWith("/move") &&
        response.request().method() === "PATCH",
    );
  }

  private async boxOf(locator: Locator) {
    const box = await locator.boundingBox();
    if (!box) {
      throw new Error("No se pudo medir el elemento");
    }
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }
}
