import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

type SortableCardProps = {
  id: string;
  title: string;
  disabled: boolean;
  children: ReactNode;
};

export const SortableCard = ({
  id,
  title,
  disabled,
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

  if (disabled) {
    return <li data-card-id={id}>{children}</li>;
  }

  return (
    <li
      ref={setNodeRef}
      data-card-id={id}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "cursor-grab touch-none rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isDragging && "opacity-40",
      )}
      {...attributes}
      {...listeners}
      aria-label={`Tarjeta ${title}`}
    >
      {children}
    </li>
  );
};
