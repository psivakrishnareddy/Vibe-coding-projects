"use client";

import { useEffect, useState } from "react";

type EditableColumnTitleProps = {
  title: string;
  onRename: (title: string) => void;
};

export function EditableColumnTitle({ title, onRename }: EditableColumnTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title);

  useEffect(() => {
    setValue(title);
  }, [title]);

  const commit = () => {
    setIsEditing(false);
    if (value.trim() && value.trim() !== title) {
      onRename(value.trim());
    }
    setValue((prev) => prev.trim() || title);
  };

  if (isEditing) {
    return (
      <input
        aria-label="Edit column title"
        className="w-full rounded-md border border-[color:var(--primary)] bg-white px-2 py-1 text-sm font-semibold text-[color:var(--navy)] outline-none"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") {
            setValue(title);
            setIsEditing(false);
          }
        }}
        autoFocus
      />
    );
  }

  return (
    <button
      type="button"
      className="w-full text-left text-sm font-semibold text-[color:var(--navy)]"
      onClick={() => setIsEditing(true)}
    >
      {title}
    </button>
  );
}
