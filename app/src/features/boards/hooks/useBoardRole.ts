import { getRouteApi } from "@tanstack/react-router";
import {
  can,
  getBoardRole,
  type BoardPermission,
} from "@/features/boards/permissions";
import type { BoardDTO } from "@/schemas/board";

const authenticatedRoute = getRouteApi("/_authenticated");

export function useBoardRole(board: BoardDTO) {
  const { user } = authenticatedRoute.useRouteContext();
  const role = getBoardRole(board, user.id);

  return {
    role,
    can: (permission: BoardPermission) => can(role, permission),
  };
}
