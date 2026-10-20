import { useState, type KeyboardEvent } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type KeyboardSensorOptions,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMoveCard } from "@/features/boards/hooks/useCardMutations";
import { getMoveAnchors, isSameAnchors } from "@/features/cards/move";
import type { CardDTO } from "@/schemas/board";

export type ColumnLayout = Record<string, string[]>;

type DragState = {
  activeId: string | null;
  layout: ColumnLayout;
  source: CardDTO[];
};

const [keyboardActivator] = KeyboardSensor.activators;

const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [role=menuitem], [role=option]";

const isFromInteractiveChild = (event: KeyboardEvent) =>
  event.target instanceof Element &&
  event.target.closest(INTERACTIVE_SELECTOR) !== null;

class CardKeyboardSensor extends KeyboardSensor {
  static activators = [
    {
      eventName: keyboardActivator.eventName,
      handler: (
        event: KeyboardEvent,
        options: KeyboardSensorOptions,
        context: Parameters<typeof keyboardActivator.handler>[2],
      ) =>
        !isFromInteractiveChild(event) &&
        keyboardActivator.handler(event, options, context),
    },
  ];
}

const findColumn = (layout: ColumnLayout, id: string) =>
  Object.hasOwn(layout, id)
    ? id
    : Object.keys(layout).find((columnId) => layout[columnId].includes(id));

type UseCardDndOptions = {
  boardId: string;
  cards: CardDTO[];
  layout: ColumnLayout;
};

export function useCardDnd({ boardId, cards, layout }: UseCardDndOptions) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const moveCard = useMoveCard(boardId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(CardKeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const isDragging = Boolean(drag?.activeId);
  const currentLayout =
    drag && (isDragging || drag.source === cards) ? drag.layout : layout;
  const activeCard = drag?.activeId
    ? (cards.find((card) => card._id === drag.activeId) ?? null)
    : null;

  const onDragStart = ({ active }: DragStartEvent) => {
    setDrag({ activeId: String(active.id), layout, source: cards });
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) {
      return;
    }
    const activeId = String(active.id);
    const overId = String(over.id);
    setDrag((prev) => {
      if (!prev) {
        return prev;
      }
      const from = findColumn(prev.layout, activeId);
      const to = findColumn(prev.layout, overId);
      if (!from || !to || from === to) {
        return prev;
      }
      const target = prev.layout[to];
      const overIndex = target.indexOf(overId);
      const insertAt = overIndex === -1 ? target.length : overIndex;
      return {
        ...prev,
        layout: {
          ...prev.layout,
          [from]: prev.layout[from].filter((id) => id !== activeId),
          [to]: [
            ...target.slice(0, insertAt),
            activeId,
            ...target.slice(insertAt),
          ],
        },
      };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const activeId = String(active.id);
    const card = cards.find((candidate) => candidate._id === activeId);
    const columnId = drag ? findColumn(drag.layout, activeId) : undefined;
    if (!drag || !over || !card || !columnId) {
      setDrag(null);
      return;
    }

    const overId = String(over.id);
    let ids = drag.layout[columnId];
    if (findColumn(drag.layout, overId) === columnId) {
      const oldIndex = ids.indexOf(activeId);
      const newIndex = ids.indexOf(overId);
      if (newIndex !== -1 && oldIndex !== newIndex) {
        ids = arrayMove(ids, oldIndex, newIndex);
      }
    }

    const anchors = getMoveAnchors(ids, activeId);
    const original = getMoveAnchors(layout[card.columnId] ?? [], activeId);
    if (columnId === card.columnId && isSameAnchors(anchors, original)) {
      setDrag(null);
      return;
    }

    setDrag({
      activeId: null,
      source: cards,
      layout: { ...drag.layout, [columnId]: ids },
    });
    moveCard.mutate({ id: activeId, columnId, ...anchors });
  };

  const onDragCancel = () => {
    setDrag(null);
  };

  return {
    layout: currentLayout,
    activeCard,
    sensors,
    handlers: { onDragStart, onDragOver, onDragEnd, onDragCancel },
  };
}
