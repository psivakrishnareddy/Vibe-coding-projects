import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddCardForm } from "@/components/AddCardForm";

describe("AddCardForm", () => {
  it("submits title and details", () => {
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);

    fireEvent.change(screen.getByTestId("add-card-title"), { target: { value: "Task" } });
    fireEvent.change(screen.getByTestId("add-card-details"), { target: { value: "Details" } });
    fireEvent.click(screen.getByRole("button", { name: "Add card" }));

    expect(onAdd).toHaveBeenCalledWith("Task", "Details");
  });

  it("does not submit when title is empty", () => {
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);

    fireEvent.click(screen.getByRole("button", { name: "Add card" }));
    expect(onAdd).not.toHaveBeenCalled();
  });
});
