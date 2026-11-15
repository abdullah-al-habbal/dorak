"use client";

import { XIcon } from "lucide-react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShiftIssue } from "@/enums/booking/shift-issue.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { Shift } from "@/interfaces/hours/shift.interface";

interface ShiftRowProps {
  /** Stable id prefix for this shift's fields. */
  id: string;
  dayLabel: string;
  shift: Shift;
  index: number;
  issue: ShiftIssue | null;
  onChange: (index: number, patch: Partial<Shift>) => void;
  onRemove: (index: number) => void;
}

export function ShiftRow({ id, dayLabel, shift, index, issue, onChange, onRemove }: ShiftRowProps): JSX.Element {
  const { dictionary } = useI18n();
  const t = dictionary.workingHours;
  const number = String(index + 1);
  const shiftName = t.shift.replace("{number}", number);
  const errorId = `${id}-error`;
  const invalid = issue !== null;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          type="time"
          step={60}
          autoComplete="off"
          required
          value={shift.opens_time}
          aria-label={`${dayLabel}, ${shiftName}: ${t.opensAt}`}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className="tabular w-32 scroll-mb-24"
          onChange={(event) => onChange(index, { opens_time: event.target.value })}
        />
        <span aria-hidden className="text-muted-foreground">–</span>
        <Input
          type="time"
          step={60}
          autoComplete="off"
          required
          value={shift.closes_time}
          aria-label={`${dayLabel}, ${shiftName}: ${t.closesAt}`}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className="tabular w-32 scroll-mb-24"
          onChange={(event) => onChange(index, { closes_time: event.target.value })}
        />
        <Button type="button" variant="ghost" size="icon" aria-label={t.removeShift.replace("{number}", number).replace("{day}", dayLabel)} onClick={() => onRemove(index)}>
          <XIcon aria-hidden />
        </Button>
      </div>
      {invalid ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {t.issues[issue]}
        </p>
      ) : null}
    </div>
  );
}
