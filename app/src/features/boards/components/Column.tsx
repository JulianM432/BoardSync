import { useState } from "react";
import { Plus } from "lucide-react";
import { ActionsMenu } from "@/components/actions-menu";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { ColumnFormDialog } from "@/features/boards/components/ColumnFormDialog";
import { useDeleteCard } from "@/features/boards/hooks/useCardMutations";
import { useDeleteColumn } from "@/features/boards/hooks/useColumnMutations";
import { CardBoard } from "@/features/cards/components/CardBoard";
import { CardFormDialog } from "@/features/cards/components/CardFormDialog";
import type { CardDTO, ColumnDTO, UserRef } from "@/schemas/board";

type ColumnProps = {
  boardId: string;
  column: ColumnDTO;
  cards: CardDTO[];
  assignees: UserRef[];
  canManageColumn: boolean;
  canWriteCards: boolean;
};

type CardDialogState = {
  open: boolean;
  card?: CardDTO;
};

export const Column = ({
  boardId,
  column,
  cards,
  assignees,
  canManageColumn,
  canWriteCards,
}: ColumnProps) => {
  const headingId = `column-${column._id}`;
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [cardDialog, setCardDialog] = useState<CardDialogState>({
    open: false,
  });
  const [deleteCardDialog, setDeleteCardDialog] = useState<CardDialogState>({
    open: false,
  });
  const deleteColumn = useDeleteColumn(boardId);
  const deleteCard = useDeleteCard(boardId);

  const handleDeleteCard = () => {
    if (!deleteCardDialog.card) {
      return;
    }
    deleteCard.mutate(deleteCardDialog.card._id, {
      onSuccess: () =>
        setDeleteCardDialog((prev) => ({ ...prev, open: false })),
    });
  };

  return (
    <section
      aria-labelledby={headingId}
      className="flex max-h-full w-72 shrink-0 flex-col rounded-xl bg-muted/50"
    >
      <header className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 id={headingId} className="truncate text-sm font-semibold">
            {column.name}
          </h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {cards.length}
          </span>
        </div>
        {canManageColumn && (
          <>
            <ActionsMenu
              label={`Opciones de la columna ${column.name}`}
              editLabel="Renombrar"
              onEdit={() => setIsRenameOpen(true)}
              onDelete={() => setIsDeleteOpen(true)}
            />
            <ColumnFormDialog
              open={isRenameOpen}
              onOpenChange={setIsRenameOpen}
              boardId={boardId}
              column={column}
            />
            <ConfirmDeleteDialog
              open={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
              title={`¿Eliminar la columna "${column.name}"?`}
              description={
                cards.length > 0
                  ? `También se van a borrar sus ${cards.length} tarjetas. Esta acción no se puede deshacer.`
                  : "Esta acción no se puede deshacer."
              }
              isPending={deleteColumn.isPending}
              onConfirm={() => deleteColumn.mutate(column._id)}
            />
          </>
        )}
      </header>

      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 py-2">
        {cards.length === 0 ? (
          <li className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            No hay tarjetas en esta columna
          </li>
        ) : (
          cards.map((card) => (
            <li key={card._id}>
              <CardBoard
                card={card}
                canEdit={canWriteCards}
                onEdit={() => setCardDialog({ open: true, card })}
                onDelete={() => setDeleteCardDialog({ open: true, card })}
              />
            </li>
          ))
        )}
      </ul>

      {canWriteCards && (
        <>
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setCardDialog({ open: true })}
            >
              <Plus />
              Agregar tarjeta
            </Button>
          </div>
          <CardFormDialog
            open={cardDialog.open}
            onOpenChange={(open) =>
              setCardDialog((prev) => ({ ...prev, open }))
            }
            boardId={boardId}
            columnId={column._id}
            assignees={assignees}
            card={cardDialog.card}
          />
          <ConfirmDeleteDialog
            open={deleteCardDialog.open}
            onOpenChange={(open) =>
              setDeleteCardDialog((prev) => ({ ...prev, open }))
            }
            title={`¿Eliminar "${deleteCardDialog.card?.title ?? ""}"?`}
            description="Esta acción no se puede deshacer."
            isPending={deleteCard.isPending}
            onConfirm={handleDeleteCard}
          />
        </>
      )}
    </section>
  );
};
