import { Button } from "@/components/ui/button";
import { CardBoard } from "@/features/cards/components/CardBoard";
import type { CardDTO, ColumnDTO } from "@/schemas/board";
import { EllipsisVertical, Plus } from "lucide-react";

type ColumnProps = {
  column: ColumnDTO;
  cards: CardDTO[]; // ya vienen ordenadas por position
};

export const Column = ({ column, cards }: ColumnProps) => {
  const headingId = `column-${column._id}`;
  

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
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`Opciones de la columna ${column.name}`}
        >
          <EllipsisVertical />
        </Button>
      </header>

      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {cards.length === 0 ? (
          <li className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            No hay tarjetas en esta columna
          </li>
        ) : (
          cards.map((card) => (
            <li key={card._id}>
              <CardBoard
                title={card.title}
                description={card.description}
                createdBy={card.createdBy}
                createdAt={card.createdAt}
              />
            </li>
          ))
        )}
      </ul>

      <div className="p-2">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Plus />
          Agregar tarjeta
        </Button>
      </div>
    </section>
  );
};
