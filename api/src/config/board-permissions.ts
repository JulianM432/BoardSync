import type { Types } from "mongoose";
import type { IBoard, MemberRole } from "../models/board.js";

export type BoardRole = "owner" | MemberRole;
export type BoardPermission =
  "board:read" | "card:write" | "column:manage" | "board:manage_members";

const permissions: Record<BoardPermission, readonly BoardRole[]> = {
  "board:read": ["owner", "editor", "viewer"],
  "card:write": ["owner", "editor"],
  "column:manage": ["owner"],
  "board:manage_members": ["owner"],
};

export function can(
  role: BoardRole | null,
  permission: BoardPermission,
): boolean {
  return role !== null && permissions[permission].includes(role);
}

export function getBoardRole(
  board: Pick<IBoard, "ownerId" | "members">,
  userId: Types.ObjectId | string,
): BoardRole | null {
  if (board.ownerId.equals(userId)) return "owner";
  return (
    board.members.find((member) => member.userId.equals(userId))?.role ?? null
  );
}
