import type { ReactElement } from "react";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ActionsMenuProps = {
  label: string;
  editLabel?: string;
  onEdit: () => void;
  onDelete: () => void;
  trigger?: ReactElement;
};

export const ActionsMenu = ({
  label,
  editLabel = "Editar",
  onEdit,
  onDelete,
  trigger = <Button size="icon-sm" variant="ghost" />,
}: ActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={trigger}
        aria-label={label}
      >
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          {editLabel}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
