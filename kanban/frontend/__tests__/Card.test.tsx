import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "@/components/Card";

describe("Card", () => {
  it("renders title and details and deletes", () => {
    const onDelete = vi.fn();
    render(
      <Card
        card={{ id: "c-1", columnId: "col-1", title: "Hello", details: "World" }}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("c-1");
  });
});
