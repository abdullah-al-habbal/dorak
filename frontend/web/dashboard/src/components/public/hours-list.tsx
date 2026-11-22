import type { JSX } from "react";

import type { Locale } from "@/enums/access/locale.enum";
import type { Weekday } from "@/enums/booking/weekday.enum";
import { shortTime, weekRows } from "@/lib/public/public-profile.util";
import { weekdayLabel } from "@/lib/hours/weekday-label.util";
import type { Dictionary } from "@/types/core/shared/dictionary.type";
import type { PublicHoursDay } from "@/types/public/public-profile.type";

interface HoursListProps {
  days: readonly PublicHoursDay[];
  /** 0 is Sunday; the page starts its week here. */
  weekStart: number;
  /** The weekday of the page's own date, marked as today. */
  today: number;
  locale: Locale;
  dictionary: Dictionary["publicProfile"];
}

/** The seven days with their shifts; today is marked in words, not colour alone. */
export function HoursList({ days, weekStart, today, locale, dictionary }: HoursListProps): JSX.Element {
  return (
    <dl className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
      {weekRows(days, weekStart).map((day) => {
        const open = !day.is_closed && day.shifts.length > 0;
        return (
          <div key={day.day_of_week} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="font-medium">
              {weekdayLabel(day.day_of_week as Weekday, locale)}
              {day.day_of_week === today ? <span className="ms-2 text-xs text-muted-foreground">({dictionary.today})</span> : null}
            </dt>
            <dd className="tabular text-muted-foreground" dir="ltr">
              {open ? day.shifts.map((shift) => `${shortTime(shift.opens_time)}–${shortTime(shift.closes_time)}`).join(", ") : dictionary.closed}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
