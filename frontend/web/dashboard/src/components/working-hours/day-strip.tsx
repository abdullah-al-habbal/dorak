import type { JSX } from "react";

import type { OpeningHoursDay } from "@/interfaces/hours/opening-hours-day.interface";
import { shiftSegment } from "@/lib/hours/opening-hours.util";

/** A 24-hour track with each shift drawn on it, so a break between shifts is visible at a glance. Decorative: the time fields carry the data. */
export function DayStrip({ day }: { day: OpeningHoursDay }): JSX.Element {
  return (
    <div aria-hidden className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
      {day.shifts.map((shift, index) => {
        const { start, width } = shiftSegment(shift);
        return <span key={index} className="absolute inset-y-0 rounded-full bg-primary" style={{ insetInlineStart: `${start}%`, width: `${width}%` }} />;
      })}
    </div>
  );
}
