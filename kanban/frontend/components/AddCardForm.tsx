"use client";

import { FormEvent, useState } from "react";

type AddCardFormProps = {
  onAdd: (title: string, details: string) => void;
};

export function AddCardForm({ onAdd }: AddCardFormProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), details.trim());
    setTitle("");
    setDetails("");
  };

  return (
    <form className="mt-3 space-y-2" onSubmit={onSubmit}>
      <input
        data-testid="add-card-title"
        placeholder="Card title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-[color:var(--navy)] outline-none focus:border-[color:var(--primary)]"
      />
      <textarea
        data-testid="add-card-details"
        placeholder="Details"
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        className="min-h-18 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-[color:var(--muted)] outline-none focus:border-[color:var(--primary)]"
      />
      <button
        type="submit"
        className="w-full rounded-md bg-[color:var(--secondary)] px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Add card
      </button>
    </form>
  );
}
