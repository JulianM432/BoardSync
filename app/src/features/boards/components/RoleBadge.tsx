import { Badge } from "@/components/ui/badge";
import type { BoardRole } from "@/features/boards/permissions";

const ROLE_LABELS: Record<BoardRole, string> = {
  owner: "Owner",
  editor: "Editor",
  viewer: "Viewer · solo lectura",
};

export const RoleBadge = ({ role }: { role: BoardRole }) => {
  return (
    <Badge variant={role === "viewer" ? "outline" : "secondary"}>
      {ROLE_LABELS[role]}
    </Badge>
  );
};
