import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditableColumnTitle } from "@/components/EditableColumnTitle";

describe("EditableColumnTitle", () => {
  it("calls onRename when editing is committed", () => {
    const onRename = vi.fn();
    render(<EditableColumnTitle title="Backlog" onRename={onRename} />);

    fireEvent.click(screen.getByRole("button", { name: "Backlog" }));
    const input = screen.getByLabelText("Edit column title");
    fireEvent.change(input, { target: { value: "To Do" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onRename).toHaveBeenCalledWith("To Do");
  });
});
