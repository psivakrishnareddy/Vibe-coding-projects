import { useState, useRef, useEffect } from "react";
import { Column, Card as CardType, Id } from "../types";
import { KanbanCard } from "./Card";
import "./Column.css";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

interface ColumnProps {
  column: Column;
  cards: CardType[];
  onAddCard: (title: string, details: string) => void;
  onRenameColumn: (title: string) => void;
  onDeleteCard: (cardId: Id) => void;
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onRenameColumn,
  onDeleteCard,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(column.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDetails, setNewCardDetails] = useState("");
  const addCardInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isAddingCard && addCardInputRef.current) {
      addCardInputRef.current.focus();
    }
  }, [isAddingCard]);

  const handleTitleSubmit = () => {
    if (editTitleValue.trim()) {
      onRenameColumn(editTitleValue.trim());
    } else {
      setEditTitleValue(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleAddCardSubmit = () => {
    if (newCardTitle.trim()) {
      onAddCard(newCardTitle.trim(), newCardDetails.trim());
    }
    setNewCardTitle("");
    setNewCardDetails("");
    setIsAddingCard(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? "column-over" : ""}`}
    >
      <div className="kanban-column-header">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            className="kanban-column-title-input"
            value={editTitleValue}
            onChange={(e) => setEditTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSubmit();
            }}
          />
        ) : (
          <h2
            className="kanban-column-title"
            onClick={() => setIsEditingTitle(true)}
            title="Click to edit"
          >
            {column.title}
          </h2>
        )}
        <span className="kanban-column-count">{cards.length}</span>
      </div>
      
      <div className="kanban-column-content">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onDelete={() => onDeleteCard(card.id)}
          />
        ))}
        {isAddingCard && (
          <div className="kanban-add-card-form">
            <input
              ref={addCardInputRef}
              className="kanban-add-card-input"
              placeholder="Card Title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            />
            <textarea
              className="kanban-add-card-textarea"
              placeholder="Details (optional)"
              value={newCardDetails}
              onChange={(e) => setNewCardDetails(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCardSubmit();
                }
              }}
            />
            <div className="kanban-add-card-actions">
              <button className="kanban-btn-primary" onClick={handleAddCardSubmit}>Add</button>
              <button className="kanban-btn-secondary" onClick={() => setIsAddingCard(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {!isAddingCard && (
        <button
          className="kanban-column-add-btn"
          onClick={() => setIsAddingCard(true)}
        >
          <Plus size={16} /> Add a card
        </button>
      )}
    </div>
  );
}
