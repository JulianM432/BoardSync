import { generateKeyBetween } from "fractional-indexing";
import type { CardDTO } from "@/schemas/board";

export type MoveAnchors = {
  prevId: string | null;
  nextId: string | null;
};

export type CardMove = MoveAnchors & {
  id: string;
  columnId: string;
};

export function getMoveAnchors(ids: string[], cardId: string): MoveAnchors {
  const index = ids.indexOf(cardId);
  if (index === -1) {
    return { prevId: null, nextId: null };
  }
  return {
    prevId: ids[index - 1] ?? null,
    nextId: ids[index + 1] ?? null,
  };
}

export function isSameAnchors(a: MoveAnchors, b: MoveAnchors) {
  return a.prevId === b.prevId && a.nextId === b.nextId;
}

export function applyOptimisticMove(
  cards: CardDTO[],
  move: CardMove,
): CardDTO[] {
  const positionOf = (id: string | null) =>
    id ? (cards.find((card) => card._id === id)?.position ?? null) : null;

  const lower = positionOf(move.prevId);
  const upper = positionOf(move.nextId);
  if (lower !== null && upper !== null && lower >= upper) {
    return cards;
  }

  let position: string;
  try {
    position = generateKeyBetween(lower, upper);
  } catch {
    return cards;
  }

  return cards.map((card) =>
    card._id === move.id
      ? { ...card, columnId: move.columnId, position }
      : card,
  );
}
