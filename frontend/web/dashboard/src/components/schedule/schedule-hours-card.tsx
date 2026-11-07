"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WEEK_START } from "@/config/week-start.constant";
import { useI18n } from "@/hooks/use-i18n";
import { useScheduleHours } from "@/hooks/use-schedule-hours";
import { formatClock, scheduleWeek } from "@/lib/schedule-hours.util";
import { weekdayLabel } from "@/lib/weekday-label.util";

/** The barber's weekly hours, read-only: they are edited in the stylist app. */
export function ScheduleHoursCard(): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { schedule: t } = dictionary;
  const query = useScheduleHours();
  const week = useMemo(() => scheduleWeek(query.data ?? [], WEEK_START[locale]), [query.data, locale]);
  const today = new Date().getDay();

  return (
    <section aria-labelledby="schedule-hours-title" className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-0.5">
        <h2 id="schedule-hours-title" className="font-heading text-lg font-semibold">{t.hours.title}</h2>
        <p className="text-sm text-muted-foreground">{t.hours.description}</p>
      </div>

      {query.isPending ? <Skeleton className="h-40 w-full" /> : null}
      {query.isError ? <ErrorState title={t.hours.errorTitle} body={t.hours.errorBody} onRetry={() => query.refetch()} /> : null}
      {query.data ? (
        <ul className="divide-y divide-border" data-testid="schedule-hours">
          {week.map(({ day, shifts }) => (
            <li key={day} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 text-sm">
              <span className="flex items-center gap-2 font-medium">
                {weekdayLabel(day, locale)}
                {day === today ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t.hours.today}</span> : null}
              </span>
              {shifts.length === 0 ? (
                <span className="text-muted-foreground">{t.hours.dayOff}</span>
              ) : (
                <span className="tabular flex flex-wrap gap-x-3 gap-y-1">
                  {shifts.map((shift) => (
                    <span key={`${shift.start}-${shift.end}`} className="rounded-md bg-muted px-2 py-0.5">
                      {t.hours.range.replace("{start}", formatClock(shift.start, locale)).replace("{end}", formatClock(shift.end, locale))}
                    </span>
                  ))}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
