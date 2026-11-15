"use client";

import { PlusIcon } from "lucide-react";
import { memo } from "react";
import type { JSX } from "react";

import { CopyDayPopover } from "@/components/working-hours/copy-day-popover";
import { DayStrip } from "@/components/working-hours/day-strip";
import { ShiftRow } from "@/components/working-hours/shift-row";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MAX_SHIFTS_PER_DAY } from "@/config/working-hours.constant";
import type { Weekday } from "@/enums/weekday.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import type { OpeningHoursDay } from "@/interfaces/hours/opening-hours-day.interface";
import type { ShiftIssueEntry } from "@/interfaces/hours/shift-issue-entry.interface";
import type { Shift } from "@/interfaces/hours/shift.interface";
import { canAddShift } from "@/lib/opening-hours.util";
import { weekdayLabel } from "@/lib/weekday-label.util";

interface WorkingHoursDayProps {
  day: OpeningHoursDay;
  /** Issues for this day only. */
  issues: readonly ShiftIssueEntry[];
  /** Weekdays in display order, for the copy menu. */
  order: readonly Weekday[];
  onToggle: (day: Weekday, open: boolean) => void;
  onAddShift: (day: Weekday) => void;
  onRemoveShift: (day: Weekday, index: number) => void;
  onUpdateShift: (day: Weekday, index: number, patch: Partial<Shift>) => void;
  onCopy: (from: Weekday, targets: readonly Weekday[]) => void;
}

function WorkingHoursDayView({ day, issues, order, onToggle, onAddShift, onRemoveShift, onUpdateShift, onCopy }: WorkingHoursDayProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const t = dictionary.workingHours;
  const label = weekdayLabel(day.day_of_week, locale);
  const labelId = `hours-day-${day.day_of_week}`;
  const open = !day.is_closed;
  const full = open && day.shifts.length >= MAX_SHIFTS_PER_DAY;

  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-3 md:grid-cols-[10rem_1fr_auto] md:items-start md:gap-x-6 md:py-4">
      <div className="flex items-center gap-3 md:col-start-1 md:row-start-1">
        <span id={labelId} className="text-base font-semibold">{label}</span>
        <Switch checked={open} aria-labelledby={labelId} onCheckedChange={(checked) => onToggle(day.day_of_week, checked)} />
      </div>

      <div className="col-span-2 flex min-w-0 flex-col gap-3 md:col-span-1 md:col-start-2 md:row-start-1">
        {open ? (
          <>
            {day.shifts.map((shift, index) => (
              <ShiftRow
                key={index}
                id={`${labelId}-shift-${index}`}
                dayLabel={label}
                shift={shift}
                index={index}
                issue={issues.find((entry) => entry.index === index)?.issue ?? null}
                onChange={(position, patch) => onUpdateShift(day.day_of_week, position, patch)}
                onRemove={(position) => onRemoveShift(day.day_of_week, position)}
              />
            ))}
            <DayStrip day={day} />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" size="sm" disabled={!canAddShift(day)} onClick={() => onAddShift(day.day_of_week)}>
                <PlusIcon aria-hidden data-icon="inline-start" />
                {t.addShift}
              </Button>
              {full ? <span className="text-sm text-muted-foreground">{t.maxShifts.replace("{count}", String(MAX_SHIFTS_PER_DAY))}</span> : null}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground md:pt-2">{t.closed}</p>
        )}
      </div>

      <div className="flex justify-end md:col-start-3 md:row-start-1">
        <CopyDayPopover source={day.day_of_week} days={order} onCopy={onCopy} />
      </div>
    </li>
  );
}

export const WorkingHoursDayRow = memo(WorkingHoursDayView);
