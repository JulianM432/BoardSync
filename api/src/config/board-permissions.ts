import { IBoard, MemberRole } from "../models/board.js";
import { Types } from "mongoose";

export type BoardRole = "owner" | MemberRole;

export const PERMISSIONS = {
  "board:read": ["owner", "editor", "viewer"],
  "card:create": ["owner", "editor"],
  "card:update": ["owner", "editor"],
  "card:move": ["owner", "editor"],
  "card:delete": ["owner", "editor"],
  "column:manage": ["owner"],
  "board:manage_members": ["owner"],
  "board:delete": ["owner"],
} as const satisfies Record<string, readonly BoardRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: BoardRole | null, permission: Permission): boolean {
  return (
    role !== null &&
    (PERMISSIONS[permission] as readonly BoardRole[]).includes(role)
  );
}

export function getBoardRole(
  board: Pick<IBoard, "ownerId" | "members">,
  userId: Types.ObjectId | string,
): BoardRole | null {
  if (board.ownerId.equals(userId)) return "owner";
  return board.members.find((m) => m.userId.equals(userId))?.role ?? null;
}
