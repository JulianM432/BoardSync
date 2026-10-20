import {
  expect,
  type APIRequestContext,
  type APIResponse,
} from "@playwright/test";
import type { CardDTO, ColumnDTO, UserRef } from "../../src/schemas/board.ts";
import { USERS, type UserKey } from "../env.ts";

export type SeededBoard = {
  id: string;
  name: string;
  columns: ColumnDTO[];
  cards: CardDTO[];
  users: Record<UserKey, UserRef>;
};

export const COLUMN_NAMES = ["Por hacer", "En curso", "Hecho"] as const;
export const CARD_TITLES = ["Tarea 1", "Tarea 2", "Tarea 3"] as const;

export const uniqueName = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;

async function json<T>(pending: Promise<APIResponse>): Promise<T> {
  const response = await pending;
  expect(response.ok(), await response.text()).toBe(true);
  const data: T = await response.json();
  return data;
}

export async function getUsers(
  admin: APIRequestContext,
): Promise<Record<UserKey, UserRef>> {
  const list = await json<(UserRef & { email: string })[]>(admin.get("users"));
  const find = (key: UserKey): UserRef => {
    const user = list.find((candidate) => candidate.email === USERS[key].email);
    if (!user) {
      throw new Error(`Falta el usuario ${USERS[key].email} en el seed`);
    }
    return { _id: user._id, username: user.username };
  };
  return {
    admin: find("admin"),
    editor: find("editor"),
    viewer: find("viewer"),
    outsider: find("outsider"),
  };
}

export async function seedBoard(
  admin: APIRequestContext,
): Promise<SeededBoard> {
  const users = await getUsers(admin);
  const name = uniqueName("e2e");
  const board = await json<{ _id: string }>(
    admin.post("boards", {
      data: {
        name,
        members: [
          { userId: users.editor._id, role: "editor" },
          { userId: users.viewer._id, role: "viewer" },
        ],
      },
    }),
  );

  const columns: ColumnDTO[] = [];
  for (const columnName of COLUMN_NAMES) {
    columns.push(
      await json<ColumnDTO>(
        admin.post(`boards/${board._id}/columns`, {
          data: { name: columnName },
        }),
      ),
    );
  }

  const cards: CardDTO[] = [];
  for (const title of CARD_TITLES) {
    cards.push(
      await json<CardDTO>(
        admin.post(`boards/${board._id}/cards`, {
          data: { title, columnId: columns[0]._id },
        }),
      ),
    );
  }

  return { id: board._id, name, columns, cards, users };
}
