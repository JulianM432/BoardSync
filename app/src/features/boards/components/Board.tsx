import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { CardDTO, ColumnDTO } from "@/schemas/board";
import { Column } from "@/features/boards/components/Column";
type BoardProps = {
  columns: ColumnDTO[];
  cards: CardDTO[];
};

// Fractional indexing: las keys se comparan por orden lexicográfico
// (code point). NO uses localeCompare: depende del locale y rompe el orden.
const byCardPosition = (a: CardDTO, b: CardDTO) =>
  a.position < b.position ? -1 : a.position > b.position ? 1 : 0;

export const Board = ({ columns, cards }: BoardProps) => {
  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns],
  );

  // Una sola pasada O(n) en vez de cards.filter() por cada columna (O(n * m)).
  const cardsByColumn = useMemo(() => {
    const map = new Map<string, CardDTO[]>();
    for (const card of cards) {
      const list = map.get(card.columnId);
      if (list) list.push(card);
      else map.set(card.columnId, [card]);
    }
    for (const list of map.values()) list.sort(byCardPosition);
    return map;
  }, [cards]);

  return (
    // h-full: el padre tiene que darle una altura (ver layout de la página).
    <div className="flex h-full items-start gap-4 overflow-x-auto p-4">
      {sortedColumns.map((column) => (
        <Column
          key={column._id}
          column={column}
          cards={cardsByColumn.get(column._id) ?? []}
        />
      ))}

      <Button variant="outline" className="w-72 shrink-0 justify-start">
        <Plus />
        Agregar columna
      </Button>
    </div>
  );
};
