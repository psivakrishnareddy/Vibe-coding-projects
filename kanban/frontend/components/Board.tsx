"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { Column } from "@/components/Column";
import { useBoardState } from "@/lib/useBoardState";
import type { Card } from "@/lib/types";

export function Board() {
  const { state, renameColumn, addCard, deleteCard, moveCard } = useBoardState();
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const cardsByColumn = useMemo(() => {
    return state.columns.reduce<Record<string, Card[]>>((acc, column) => {
      acc[column.id] = state.cards.filter((card) => card.columnId === column.id);
      return acc;
    }, {});
  }, [state.cards, state.columns]);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const activeCardId = String(active.id);
    const activeCard = state.cards.find((card) => card.id === activeCardId);
    if (!activeCard) return;

    const overId = String(over.id);
    const overCard = state.cards.find((card) => card.id === overId);
    const toColumnId = overId.startsWith("column-")
      ? overId.replace("column-", "")
      : overCard?.columnId ?? activeCard.columnId;

    if (toColumnId !== activeCard.columnId) {
      moveCard(activeCard.id, toColumnId);
      return;
    }

    const columnCards = cardsByColumn[activeCard.columnId] ?? [];
    const oldIndex = columnCards.findIndex((card) => card.id === activeCard.id);
    const newIndex = columnCards.findIndex((card) => card.id === overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(columnCards, oldIndex, newIndex);
    reordered.forEach((card, index) => moveCard(card.id, card.columnId, index));
  };

  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="flex min-h-screen flex-col px-4 py-6 md:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[color:var(--navy)]">Kanban Board</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Single-board workflow with simple drag-and-drop cards.
        </p>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(event) => {
          const current = state.cards.find((card) => card.id === String(event.active.id)) ?? null;
          setActiveCard(current);
        }}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={state.columns.map((column) => `column-${column.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          <main className="flex flex-1 gap-4 overflow-x-auto pb-4">
            {state.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                cards={cardsByColumn[column.id] ?? []}
                onRename={(title) => renameColumn(column.id, title)}
                onAddCard={(title, details) => addCard(column.id, title, details)}
                onDeleteCard={deleteCard}
              />
            ))}
          </main>
        </SortableContext>
        <DragOverlay>
          {activeCard ? (
            <div className="w-[260px] rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
              <h3 className="text-sm font-semibold text-[color:var(--navy)]">{activeCard.title}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{activeCard.details}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
