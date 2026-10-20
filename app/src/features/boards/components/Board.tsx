import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { CardDTO, ColumnDTO } from "@/schemas/board";
import { Column } from "@/features/boards/components/Column";

type BoardProps = {
  columns: ColumnDTO[];
  cards: CardDTO[];
  canManageColumns: boolean;
  canWriteCards: boolean;
};

const byCardPosition = (a: CardDTO, b: CardDTO) =>
  a.position < b.position ? -1 : a.position > b.position ? 1 : 0;

export const Board = ({
  columns,
  cards,
  canManageColumns,
  canWriteCards,
}: BoardProps) => {
  const sortedColumns = useMemo(
    () => columns.toSorted((a, b) => a.position - b.position),
    [columns],
  );

  const cardsByColumn = useMemo(() => {
    const map = new Map<string, CardDTO[]>();
    for (const card of cards) {
      const list = map.get(card.columnId);
      if (list) {
        list.push(card);
      } else {
        map.set(card.columnId, [card]);
      }
    }
    for (const list of map.values()) {
      list.sort(byCardPosition);
    }
    return map;
  }, [cards]);

  return (
    <div className="flex h-full items-start gap-4 overflow-x-auto p-4">
      {sortedColumns.map((column) => (
        <Column
          key={column._id}
          column={column}
          cards={cardsByColumn.get(column._id) ?? []}
          canManageColumn={canManageColumns}
          canWriteCards={canWriteCards}
        />
      ))}

      {canManageColumns && (
        <Button variant="outline" className="w-72 shrink-0 justify-start">
          <Plus />
          Agregar columna
        </Button>
      )}
    </div>
  );
};
