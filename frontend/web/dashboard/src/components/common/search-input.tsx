"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { JSX } from "react";

import { Input } from "@/components/ui/input";

const SEARCH_DEBOUNCE_MS = 300;
const MAX_SEARCH = 100;

interface SearchInputProps {
  /** The committed (URL) value. */
  value: string | undefined;
  label: string;
  onCommit: (value: string | undefined) => void;
}

/** A debounced search box that adopts external changes (e.g. "Clear filters") without clobbering typing. */
export function SearchInput({ value, label, onCommit }: SearchInputProps): JSX.Element {
  const [text, setText] = useState(value ?? "");
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    setSeen(value);
    if (text.trim() !== (value ?? "")) setText(value ?? "");
  }

  useEffect(() => {
    if (text.trim() === (value ?? "")) return;
    const id = setTimeout(() => onCommit(text.trim() || undefined), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [text, value, onCommit]);

  return (
    <label className="relative w-full sm:w-72">
      <span className="sr-only">{label}</span>
      <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" aria-hidden />
      <Input type="search" value={text} onChange={(event) => setText(event.target.value)} placeholder={label} maxLength={MAX_SEARCH} className="ps-9" />
    </label>
  );
}
