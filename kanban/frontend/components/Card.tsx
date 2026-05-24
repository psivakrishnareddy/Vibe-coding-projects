"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Card as CardType } from "@/lib/types";

type CardProps = {
  card: CardType;
  onDelete: (cardId: string) => void;
};

export function Card({ card, onDelete }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", columnId: card.columnId },
  });

  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      data-testid={`card-${card.id}`}
      className="cursor-grab rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
    >
      <div className={`space-y-2 ${isDragging ? "opacity-60" : ""}`}>
        <h3 className="text-sm font-semibold text-[color:var(--navy)]">{card.title}</h3>
        <p className="text-sm text-[color:var(--muted)]">{card.details}</p>
      </div>
      <button
        type="button"
        className="mt-3 text-xs font-medium text-[color:var(--primary)] underline-offset-2 hover:underline"
        onClick={() => onDelete(card.id)}
      >
        Delete
      </button>
    </article>
  );
}
