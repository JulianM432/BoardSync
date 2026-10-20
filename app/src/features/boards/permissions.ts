import type { BoardDTO, BoardMemberDTO } from "@/schemas/board";

export type BoardRole = "owner" | BoardMemberDTO["role"];

export type BoardPermission =
  | "board:read"
  | "board:manage"
  | "card:write"
  | "column:manage"
  | "board:manage_members";

const permissions: Record<BoardPermission, readonly BoardRole[]> = {
  "board:read": ["owner", "editor", "viewer"],
  "board:manage": ["owner"],
  "card:write": ["owner", "editor"],
  "column:manage": ["owner"],
  "board:manage_members": ["owner"],
};

export function can(role: BoardRole | null, permission: BoardPermission) {
  return role !== null && permissions[permission].includes(role);
}

export function getBoardRole(board: BoardDTO, userId: string): BoardRole | null {
  if (board.ownerId._id === userId) {
    return "owner";
  }
  return (
    board.members.find((member) => member.userId._id === userId)?.role ?? null
  );
}
