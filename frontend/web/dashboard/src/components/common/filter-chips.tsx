"use client";

import { XIcon } from "lucide-react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/hooks/core/use-dictionary";
import type { FilterChip } from "@/interfaces/ui/filter-chip.interface";

interface FilterChipsProps {
  chips: readonly FilterChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

/** Active filters as removable tags. Renders nothing when no filter is active. */
export function FilterChips({ chips, onRemove, onClearAll }: FilterChipsProps): JSX.Element | null {
  const { common } = useDictionary();
  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label={common.filters.active}>
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            aria-label={common.filters.remove.replace("{filter}", `${chip.label}: ${chip.valueLabel}`)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card ps-3 pe-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <span className="text-muted-foreground">{chip.label}:</span>
            <span className="font-medium">{chip.valueLabel}</span>
            <XIcon className="size-3.5 text-muted-foreground" aria-hidden />
          </button>
        </li>
      ))}
      {chips.length > 1 ? (
        <li>
          <Button variant="ghost" size="sm" onClick={onClearAll}>{common.filters.clearAll}</Button>
        </li>
      ) : null}
    </ul>
  );
}
