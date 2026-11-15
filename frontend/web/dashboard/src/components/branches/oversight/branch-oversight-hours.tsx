"use client";

import type { JSX } from "react";

import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOpeningHours } from "@/hooks/hours/use-opening-hours";
import { weekdayLabel } from "@/lib/hours/weekday-label.util";

/** The branch's opening hours, read-only. */
export function BranchOversightHours({ branchId }: { branchId: string }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { branchOversight: t } = dictionary;
  const query = useOpeningHours(branchId);

  return (
    <section aria-label={t.hours.title} className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{t.hours.title}</h3>
      {query.isError ? <p role="alert" className="text-sm text-destructive">{t.loadFailed}</p> : null}
      {query.data && query.data.every((day) => day.is_closed && day.shifts.length === 0) ? <p className="text-sm text-muted-foreground">{t.hours.notConfigured}</p> : null}
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {query.data?.map((day) => (
          <li key={day.day_of_week} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-1.5 text-sm">
            <span>{weekdayLabel(day.day_of_week, locale)}</span>
            <span dir="ltr" className="tabular text-muted-foreground">
              {day.is_closed || day.shifts.length === 0 ? t.hours.closed : day.shifts.map((shift) => `${shift.opens_time}–${shift.closes_time}`).join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
