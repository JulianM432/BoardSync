import { useState, type ReactElement } from "react";
import { ActionsMenu } from "@/components/actions-menu";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { BoardFormDialog } from "@/features/boards/components/BoardFormDialog";
import { useDeleteBoard } from "@/features/boards/hooks/useBoardMutations";
import type { BoardDTO } from "@/schemas/board";

type BoardActionsProps = {
  board: BoardDTO;
  trigger?: ReactElement;
};

export const BoardActions = ({ board, trigger }: BoardActionsProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteBoard = useDeleteBoard(board._id);

  return (
    <>
      <ActionsMenu
        label={`Opciones del board ${board.name}`}
        onEdit={() => setIsEditOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
        trigger={trigger}
      />
      <BoardFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        board={board}
      />
      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={`¿Eliminar "${board.name}"?`}
        description="Se van a borrar también todas sus columnas y tarjetas. Esta acción no se puede deshacer."
        isPending={deleteBoard.isPending}
        onConfirm={() => deleteBoard.mutate()}
      />
    </>
  );
};
