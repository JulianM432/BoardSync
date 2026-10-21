import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export type CardMover = {
  username: string;
  color: string;
};

type SortableCardProps = {
  id: string;
  title: string;
  disabled: boolean;
  movedBy?: CardMover;
  children: ReactNode;
};

const MovedByBadge = ({ movedBy }: { movedBy: CardMover }) => (
  <span
    className="absolute -top-2 right-3 z-10 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white shadow-sm"
    style={{ backgroundColor: movedBy.color }}
  >
    {movedBy.username} la está moviendo
  </span>
);

export const SortableCard = ({
  id,
  title,
  disabled,
  movedBy,
  children,
}: SortableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const remoteStyle = movedBy
    ? { outline: `2px dashed ${movedBy.color}`, outlineOffset: "2px" }
    : undefined;

  if (disabled) {
    return (
      <li data-card-id={id} className="relative rounded-xl" style={remoteStyle}>
        {movedBy && <MovedByBadge movedBy={movedBy} />}
        {children}
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      data-card-id={id}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        ...remoteStyle,
      }}
      className={cn(
        "relative cursor-grab touch-none rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isDragging && "opacity-40",
      )}
      {...attributes}
      {...listeners}
      aria-label={`Tarjeta ${title}`}
    >
      {movedBy && <MovedByBadge movedBy={movedBy} />}
      {children}
    </li>
  );
};
