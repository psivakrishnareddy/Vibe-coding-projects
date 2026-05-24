import { describe, expect, it } from "vitest";
import { initialBoardState } from "@/lib/dummyData";

describe("dummyData", () => {
  it("has exactly five columns", () => {
    expect(initialBoardState.columns).toHaveLength(5);
  });

  it("has cards assigned to valid columns", () => {
    const validColumnIds = new Set(initialBoardState.columns.map((column) => column.id));
    for (const card of initialBoardState.cards) {
      expect(validColumnIds.has(card.columnId)).toBe(true);
    }
  });
});
