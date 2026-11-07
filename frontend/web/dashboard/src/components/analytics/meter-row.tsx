import type { JSX } from "react";

const FULL_PERCENT = 100;

interface MeterRowProps {
  label: string;
  /** The figure as text; the bar below only repeats it visually. */
  valueLabel: string;
  value: number;
  total: number;
}

/** A label, its figure and a thin proportional bar. Meaning is carried by the text, never by the bar. */
export function MeterRow({ label, valueLabel, value, total }: MeterRowProps): JSX.Element {
  const percent = total > 0 ? Math.round((value / total) * FULL_PERCENT) : 0;
  return (
    <li className="flex flex-col gap-1.5 py-2.5 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="min-w-0 truncate" dir="auto">{label}</span>
        <span className="tabular shrink-0 font-semibold">{valueLabel}</span>
      </div>
      <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </li>
  );
}
