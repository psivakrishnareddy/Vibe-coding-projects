"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { AddCardForm } from "@/components/AddCardForm";
import { Card } from "@/components/Card";
import { EditableColumnTitle } from "@/components/EditableColumnTitle";
import type { Card as CardType, Column as ColumnType } from "@/lib/types";

type ColumnProps = {
  column: ColumnType;
  cards: CardType[];
  onRename: (title: string) => void;
  onAddCard: (title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

export function Column({ column, cards, onRename, onAddCard, onDeleteCard }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  return (
    <section
      ref={setNodeRef}
      data-testid={`column-${column.id}`}
      className={`w-[280px] min-w-[280px] rounded-2xl border border-zinc-200 bg-[#fcfcfd] p-3 shadow-sm ${
        isOver ? "ring-2 ring-[color:var(--primary)]" : ""
      }`}
    >
      <div className="mb-3 border-t-4 border-[color:var(--accent)] pt-2">
        <EditableColumnTitle title={column.title} onRename={onRename} />
      </div>
      <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {cards.map((card) => (
            <Card key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </div>
      </SortableContext>
      <AddCardForm onAdd={onAddCard} />
    </section>
  );
}
