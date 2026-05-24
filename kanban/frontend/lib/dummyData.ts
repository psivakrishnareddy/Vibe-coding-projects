import type { BoardState } from "@/lib/types";

export const initialBoardState: BoardState = {
  columns: [
    { id: "col-1", title: "Backlog" },
    { id: "col-2", title: "Ready" },
    { id: "col-3", title: "In Progress" },
    { id: "col-4", title: "Review" },
    { id: "col-5", title: "Done" },
  ],
  cards: [
    {
      id: "card-1",
      columnId: "col-1",
      title: "Clarify homepage copy",
      details: "Draft concise headline and supporting body text.",
    },
    {
      id: "card-2",
      columnId: "col-1",
      title: "Collect competitor screenshots",
      details: "Grab recent board UI references for alignment.",
    },
    {
      id: "card-3",
      columnId: "col-2",
      title: "Finalize color token usage",
      details: "Map brand colors to reusable CSS variables.",
    },
    {
      id: "card-4",
      columnId: "col-2",
      title: "Define board spacing scale",
      details: "Set consistent spacing for cards and columns.",
    },
    {
      id: "card-5",
      columnId: "col-3",
      title: "Implement drag interactions",
      details: "Enable pointer drag between all columns.",
    },
    {
      id: "card-6",
      columnId: "col-3",
      title: "Build add card form",
      details: "Title required, details optional in each column.",
    },
    {
      id: "card-7",
      columnId: "col-4",
      title: "Run UX pass",
      details: "Check hover, focus, and keyboard interactions.",
    },
    {
      id: "card-8",
      columnId: "col-5",
      title: "Publish MVP notes",
      details: "Summarize delivered scope and known limitations.",
    },
  ],
};
