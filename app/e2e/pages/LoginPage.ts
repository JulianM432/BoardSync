import type { Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get email() {
    return this.page.getByLabel("Email");
  }

  get password() {
    return this.page.getByLabel("Password", { exact: true });
  }

  get submit() {
    return this.page.getByRole("button", {
      name: "Login",
      exact: true,
    });
  }

  get error() {
    return this.page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
