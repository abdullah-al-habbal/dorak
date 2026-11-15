"use client";

import { CopyIcon } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Weekday } from "@/enums/weekday.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { weekdayLabel } from "@/lib/hours/weekday-label.util";

interface CopyDayPopoverProps {
  source: Weekday;
  /** Days in display order, including the source. */
  days: readonly Weekday[];
  onCopy: (from: Weekday, targets: readonly Weekday[]) => void;
}

export function CopyDayPopover({ source, days, onCopy }: CopyDayPopoverProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const t = dictionary.workingHours.copy;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<readonly Weekday[]>([]);
  const targets = days.filter((day) => day !== source);
  const allSelected = targets.length > 0 && targets.every((day) => selected.includes(day));
  const sourceLabel = weekdayLabel(source, locale);

  const toggle = (day: Weekday): void => setSelected((current) => (current.includes(day) ? current.filter((entry) => entry !== day) : [...current, day]));
  const toggleAll = (): void => setSelected(allSelected ? [] : targets);
  const apply = (): void => {
    onCopy(source, selected);
    setSelected([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button type="button" variant="ghost" size="icon" aria-label={t.action.replace("{day}", sourceLabel)} />}>
        <CopyIcon aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end">
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 font-medium">{t.title.replace("{day}", sourceLabel)}</legend>
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input type="checkbox" className="size-4 accent-primary" checked={allSelected} onChange={toggleAll} />
            {t.selectAll}
          </label>
          {targets.map((day) => (
            <label key={day} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="checkbox" className="size-4 accent-primary" checked={selected.includes(day)} onChange={() => toggle(day)} />
              {weekdayLabel(day, locale)}
            </label>
          ))}
        </fieldset>
        <Button type="button" disabled={selected.length === 0} onClick={apply}>
          {t.apply}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
