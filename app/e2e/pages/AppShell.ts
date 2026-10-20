import type { Page } from "@playwright/test";

export class AppShell {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get emptyState() {
    return this.page.getByText("Seleccioná un board para empezar.");
  }

  get newBoardButton() {
    return this.page.getByRole("button", {
      name: "Nuevo board",
    });
  }

  get logoutButton() {
    return this.page.getByRole("button", {
      name: "Cerrar sesión",
    });
  }

  get boardDialog() {
    return this.page.getByRole("dialog", { name: "Nuevo board" });
  }

  boardLink(name: string) {
    return this.page.getByRole("link", { name });
  }

  toast(text: string) {
    return this.page.getByText(text);
  }

  async createBoard(name: string) {
    await this.newBoardButton.click();
    await this.boardDialog.getByLabel("Nombre").fill(name);
    await this.boardDialog.getByRole("button", { name: "Crear" }).click();
  }
}
