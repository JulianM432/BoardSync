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
}
