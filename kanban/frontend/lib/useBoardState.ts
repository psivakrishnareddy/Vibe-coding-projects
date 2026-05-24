"use client";

import { useMemo, useState } from "react";
import { initialBoardState } from "@/lib/dummyData";
import type { BoardState, Card } from "@/lib/types";

export function renameColumnInState(
  state: BoardState,
  columnId: string,
  title: string
): BoardState {
  return {
    ...state,
    columns: state.columns.map((column) =>
      column.id === columnId ? { ...column, title: title.trim() || column.title } : column
    ),
  };
}

export function addCardInState(
  state: BoardState,
  columnId: string,
  title: string,
  details: string
): BoardState {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return state;

  const nextCard: Card = {
    id: crypto.randomUUID(),
    columnId,
    title: normalizedTitle,
    details: details.trim(),
  };

  return { ...state, cards: [...state.cards, nextCard] };
}

export function deleteCardInState(state: BoardState, cardId: string): BoardState {
  return { ...state, cards: state.cards.filter((card) => card.id !== cardId) };
}

export function moveCardInState(
  state: BoardState,
  cardId: string,
  toColumnId: string,
  index?: number
): BoardState {
  const movingCard = state.cards.find((card) => card.id === cardId);
  if (!movingCard) return state;

  const remainingCards = state.cards.filter((card) => card.id !== cardId);
  const targetCards = remainingCards.filter((card) => card.columnId === toColumnId);
  const insertIndex = Math.max(0, Math.min(index ?? targetCards.length, targetCards.length));

  const updatedCard = { ...movingCard, columnId: toColumnId };
  const nextTargetCards = [
    ...targetCards.slice(0, insertIndex),
    updatedCard,
    ...targetCards.slice(insertIndex),
  ];

  const nextCards: Card[] = [];
  const usedTargetCardIds = new Set(nextTargetCards.map((card) => card.id));

  for (const card of remainingCards) {
    if (card.columnId === toColumnId && usedTargetCardIds.has(card.id)) continue;
    nextCards.push(card);
  }

  const firstTargetIndex = nextCards.findIndex((card) => card.columnId === toColumnId);
  if (firstTargetIndex === -1) {
    nextCards.push(...nextTargetCards);
  } else {
    nextCards.splice(firstTargetIndex, 0, ...nextTargetCards);
  }

  return { ...state, cards: nextCards };
}

export function useBoardState() {
  const [state, setState] = useState<BoardState>(initialBoardState);

  const actions = useMemo(
    () => ({
      renameColumn: (columnId: string, title: string) => {
        setState((prev) => renameColumnInState(prev, columnId, title));
      },
      addCard: (columnId: string, title: string, details: string) => {
        setState((prev) => addCardInState(prev, columnId, title, details));
      },
      deleteCard: (cardId: string) => {
        setState((prev) => deleteCardInState(prev, cardId));
      },
      moveCard: (cardId: string, toColumnId: string, index?: number) => {
        setState((prev) => moveCardInState(prev, cardId, toColumnId, index));
      },
    }),
    []
  );

  return { state, ...actions };
}
