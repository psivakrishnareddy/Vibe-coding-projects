import { useState, useEffect } from "react";
import { Column, Card, Id } from "../types";
import { KanbanColumn } from "./Column";
import "./KanbanBoard.css";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from "@dnd-kit/core";
import { KanbanCard } from "./Card";

const defaultColumns: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
  { id: "archived", title: "Archived" },
];

const defaultCards: Card[] = [
  { id: "1", columnId: "todo", title: "Design UI", details: "Create gorgeous interface using glassmorphism" },
  { id: "2", columnId: "todo", title: "Setup Project", details: "Configure Next.js and Tailwind" },
  { id: "3", columnId: "in-progress", title: "Drag & Drop", details: "Implement smooth sorting with dnd-kit" },
  { id: "4", columnId: "review", title: "Testing", details: "Write unit and e2e tests using Vitest and Playwright" },
  { id: "5", columnId: "done", title: "Requirements", details: "Collect business rules and design aesthetics" },
];

export function KanbanBoard() {
  const [isMounted, setIsMounted] = useState(false);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [cards, setCards] = useState<Card[]>(defaultCards);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addCard = (columnId: Id, title: string, details: string) => {
    const newCard: Card = {
      id: crypto.randomUUID(),
      columnId,
      title,
      details,
    };
    setCards([...cards, newCard]);
  };

  const deleteCard = (cardId: Id) => {
    setCards(cards.filter((c) => c.id !== cardId));
  };

  const renameColumn = (columnId: Id, title: string) => {
    setColumns(
      columns.map((c) => (c.id === columnId ? { ...c, title } : c))
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;

    if (!over) return;

    const cardId = active.id;
    const toColumnId = over.id;

    setCards((cards) =>
      cards.map((c) => (c.id === cardId ? { ...c, columnId: toColumnId } : c))
    );
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="kanban-layout">
      <header className="kanban-app-header">
        <h1>Project Kanban</h1>
      </header>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          <div className="kanban-columns-container">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                cards={cards.filter((c) => c.columnId === col.id)}
                onAddCard={(title, details) => addCard(col.id, title, details)}
                onRenameColumn={(title) => renameColumn(col.id, title)}
                onDeleteCard={deleteCard}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? <KanbanCard card={activeCard} onDelete={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
