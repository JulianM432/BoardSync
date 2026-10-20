import { PASSWORD, USERS } from "../env.ts";
import { expect, test } from "../fixtures/index.ts";
import { uniqueName } from "../fixtures/seed.ts";

const newUser = (password: string) => ({
  username: uniqueName("user"),
  email: `${uniqueName("user")}@e2e.test`,
  password,
});

test.describe("POST /auth/register", () => {
  const weakPasswords = [
    ["Corta1!", "La contraseña debe tener al menos 8 caracteres"],
    ["sinmayuscula1!", "La contraseña debe tener al menos una mayúscula"],
    ["SinNumero!!", "La contraseña debe tener al menos un número"],
    ["SinSimbolo123", "La contraseña debe tener al menos un símbolo"],
  ] as const;

  for (const [password, message] of weakPasswords) {
    test(`rechaza "${password}" con el motivo`, async ({ request }) => {
      const response = await request.post("auth/register", {
        data: newUser(password),
      });
      expect(response.status()).toBe(400);
      const body: { errors: string[] } = await response.json();
      expect(body.errors).toContain(message);
    });
  }

  test("crea el usuario con un password válido", async ({ request, apiAs }) => {
    const response = await request.post("auth/register", {
      data: newUser("Valido123!"),
    });
    expect(response.ok()).toBe(true);
    const user: { id: string } = await response.json();
    expect(user.id).toBeTruthy();

    const admin = await apiAs("admin");
    expect((await admin.delete(`users/${user.id}`)).ok()).toBe(true);
  });
});

test.describe("POST /auth/login", () => {
  test("con credenciales válidas devuelve una cookie httpOnly", async ({
    request,
  }) => {
    const response = await request.post("auth/login", {
      data: { email: USERS.editor.email, password: PASSWORD },
    });
    expect(response.ok()).toBe(true);
    const cookie = response.headers()["set-cookie"];
    expect(cookie).toMatch(/^token=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  test("con un password incorrecto responde 401", async ({ request }) => {
    const response = await request.post("auth/login", {
      data: { email: USERS.editor.email, password: "Incorrecta123!" },
    });
    expect(response.status()).toBe(401);
  });
});
