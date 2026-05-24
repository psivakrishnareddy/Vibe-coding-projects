import { describe, expect, it, vi } from "vitest";
import { initialBoardState } from "@/lib/dummyData";
import {
  addCardInState,
  deleteCardInState,
  moveCardInState,
  renameColumnInState,
} from "@/lib/useBoardState";

describe("useBoardState helpers", () => {
  it("renames a column", () => {
    const result = renameColumnInState(initialBoardState, "col-1", "Ideas");
    expect(result.columns.find((column) => column.id === "col-1")?.title).toBe("Ideas");
  });

  it("adds a card", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "new-id" });
    const result = addCardInState(initialBoardState, "col-2", "New task", "details");
    expect(result.cards.at(-1)).toMatchObject({ id: "new-id", columnId: "col-2" });
  });

  it("deletes a card", () => {
    const result = deleteCardInState(initialBoardState, "card-1");
    expect(result.cards.some((card) => card.id === "card-1")).toBe(false);
  });

  it("moves a card across columns", () => {
    const result = moveCardInState(initialBoardState, "card-1", "col-5");
    const moved = result.cards.find((card) => card.id === "card-1");
    expect(moved?.columnId).toBe("col-5");
  });
});
