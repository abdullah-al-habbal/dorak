"use client";

import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import type { Weekday } from "@/enums/booking/weekday.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { ALL_DAYS } from "@/lib/hours/opening-hours.util";
import { weekdayLabel } from "@/lib/hours/weekday-label.util";

interface WeekdayPickerProps {
  label: string;
  value: Weekday[];
  onChange: (value: Weekday[]) => void;
}

/** Toggle buttons for a set of weekdays; none selected means every day. */
export function WeekdayPicker({ label, value, onChange }: WeekdayPickerProps): JSX.Element {
  const { locale } = useI18n();
  const toggle = (day: Weekday): void => onChange(value.includes(day) ? value.filter((item) => item !== day) : [...value, day]);

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {ALL_DAYS.map((day) => (
        <Button key={day} type="button" size="sm" variant={value.includes(day) ? "default" : "outline"} aria-pressed={value.includes(day)} onClick={() => toggle(day)}>
          {weekdayLabel(day, locale, "short")}
        </Button>
      ))}
    </div>
  );
}
