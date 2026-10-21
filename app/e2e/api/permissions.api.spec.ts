import type { UserKey } from "../env.ts";
import { expect, test } from "../fixtures/index.ts";
import type { SeededBoard } from "../fixtures/seed.ts";

type Case = {
  title: string;
  user: UserKey;
  request: (board: SeededBoard) => {
    method: "get" | "post" | "patch";
    path: string;
    data?: object;
  };
  status: number;
};

const cases: Case[] = [
  {
    title: "el editor crea tarjetas",
    user: "editor",
    request: (board) => ({
      method: "post",
      path: `boards/${board.id}/cards`,
      data: { title: "Del editor", columnId: board.columns[0]._id },
    }),
    status: 201,
  },
  {
    title: "el editor no crea columnas",
    user: "editor",
    request: (board) => ({
      method: "post",
      path: `boards/${board.id}/columns`,
      data: { name: "No debería" },
    }),
    status: 403,
  },
  {
    title: "el editor no edita el board",
    user: "editor",
    request: (board) => ({
      method: "patch",
      path: `boards/${board.id}`,
      data: { name: "No debería" },
    }),
    status: 403,
  },
  {
    title: "el viewer no crea tarjetas",
    user: "viewer",
    request: (board) => ({
      method: "post",
      path: `boards/${board.id}/cards`,
      data: { title: "No debería", columnId: board.columns[0]._id },
    }),
    status: 403,
  },
  {
    title: "el viewer no mueve tarjetas",
    user: "viewer",
    request: (board) => ({
      method: "patch",
      path: `boards/${board.id}/cards/${board.cards[0]._id}/move`,
      data: { columnId: board.columns[1]._id, prevId: null, nextId: null },
    }),
    status: 403,
  },
  {
    title: "un usuario ajeno no ve el board",
    user: "outsider",
    request: (board) => ({ method: "get", path: `boards/${board.id}` }),
    status: 404,
  },
  {
    title: "un usuario ajeno no lista sus tarjetas",
    user: "outsider",
    request: (board) => ({ method: "get", path: `boards/${board.id}/cards` }),
    status: 404,
  },
];

test.describe("permisos de la API según el rol en el board", () => {
  for (const { title, user, request, status } of cases) {
    test(`${title} (${status})`, async ({ apiAs, board }) => {
      const api = await apiAs(user);
      const { method, path, data } = request(board);
      const response = await api[method](path, { data });
      expect(response.status()).toBe(status);
    });
  }

  test("solo un admin crea boards", async ({ apiAs }) => {
    const editor = await apiAs("editor");
    const response = await editor.post("boards", {
      data: { name: "No debería", members: [] },
    });
    expect(response.status()).toBe(403);
  });

  test("sin sesión responde 401", async ({ request, board }) => {
    const response = await request.get(`boards/${board.id}`);
    expect(response.status()).toBe(401);
  });
});
