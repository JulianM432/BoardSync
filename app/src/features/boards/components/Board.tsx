import { useMemo, useState } from "react";
import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { CardDTO, ColumnDTO, UserRef } from "@/schemas/board";
import { Column } from "@/features/boards/components/Column";
import { ColumnFormDialog } from "@/features/boards/components/ColumnFormDialog";
import {
  useCardDnd,
  type ColumnLayout,
} from "@/features/boards/hooks/useCardDnd";
import { CardBoard } from "@/features/cards/components/CardBoard";

type BoardProps = {
  boardId: string;
  columns: ColumnDTO[];
  cards: CardDTO[];
  assignees: UserRef[];
  canManageColumns: boolean;
  canWriteCards: boolean;
};

const byCardPosition = (a: CardDTO, b: CardDTO) =>
  a.position < b.position ? -1 : a.position > b.position ? 1 : 0;

export const Board = ({
  boardId,
  columns,
  cards,
  assignees,
  canManageColumns,
  canWriteCards,
}: BoardProps) => {
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const sortedColumns = useMemo(
    () => columns.toSorted((a, b) => a.position - b.position),
    [columns],
  );

  const cardsById = useMemo(
    () => new Map(cards.map((card) => [card._id, card])),
    [cards],
  );

  const layout = useMemo(() => {
    const result: ColumnLayout = {};
    for (const column of columns) {
      result[column._id] = [];
    }
    for (const card of cards.toSorted(byCardPosition)) {
      result[card.columnId]?.push(card._id);
    }
    return result;
  }, [columns, cards]);

  const dnd = useCardDnd({ boardId, cards, layout });

  const cardsOf = (columnId: string) =>
    (dnd.layout[columnId] ?? []).flatMap((id) => {
      const card = cardsById.get(id);
      return card ? [card] : [];
    });

  return (
    <DndContext
      sensors={dnd.sensors}
      collisionDetection={closestCorners}
      {...dnd.handlers}
    >
      <div className="flex h-full items-start gap-4 overflow-x-auto p-4">
        {sortedColumns.map((column) => (
          <Column
            key={column._id}
            boardId={boardId}
            column={column}
            assignees={assignees}
            cards={cardsOf(column._id)}
            canManageColumn={canManageColumns}
            canWriteCards={canWriteCards}
          />
        ))}

        {canManageColumns && (
          <>
            <Button
              variant="outline"
              className="w-72 shrink-0 justify-start"
              onClick={() => setIsCreateColumnOpen(true)}
            >
              <Plus />
              Agregar columna
            </Button>
            <ColumnFormDialog
              open={isCreateColumnOpen}
              onOpenChange={setIsCreateColumnOpen}
              boardId={boardId}
            />
          </>
        )}
      </div>
      <DragOverlay>
        {dnd.activeCard && (
          <CardBoard
            card={dnd.activeCard}
            className="rotate-2 cursor-grabbing shadow-lg"
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};
