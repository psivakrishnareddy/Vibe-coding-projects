import { Card as CardType } from "../types";
import "./Card.css";
import { GripVertical, Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface CardProps {
  card: CardType;
  onDelete: () => void;
}

export function KanbanCard({ card, onDelete }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: { card },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="kanban-card">
      <div
        className="kanban-card-drag-handle"
        {...listeners}
        {...attributes}
      >
        <GripVertical size={16} color="var(--color-gray-text)" />
      </div>
      <div className="kanban-card-content">
        <h3 className="kanban-card-title">{card.title}</h3>
        {card.details && <p className="kanban-card-details">{card.details}</p>}
      </div>
      <button 
        className="kanban-card-delete-btn" 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete card"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
