"use client";

import { useState } from "react";
import type { JSX } from "react";

import type { BarChartDatum } from "@/interfaces/bar-chart-datum.interface";
import { cn } from "@/lib/utils";

const MIN_BAR_PERCENT = 2;
const FULL_PERCENT = 100;

interface BarChartProps {
  title: string;
  /** What a screen reader hears; the same numbers are in the table below the chart. */
  summary: string;
  data: readonly BarChartDatum[];
  /** Tailwind background token class for the bars. */
  barClassName: string;
  /** Rendered as the big readout when nothing is hovered, e.g. the period total. */
  idleReadout: string;
}

/**
 * A flex-row bar chart: bars sit in reading order, so Arabic mirrors for free. Pointer
 * and touch show one bar's value in the readout; keyboard and screen-reader users get the
 * data from `summary` and the table.
 */
export function BarChart({ title, summary, data, barClassName, idleReadout }: BarChartProps): JSX.Element {
  const [active, setActive] = useState<number | null>(null);
  const peak = Math.max(...data.map((datum) => datum.value), 0);
  const readout = active === null ? idleReadout : `${data[active].label}: ${data[active].valueLabel}`;

  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-sm font-medium">{title}</span>
        <span aria-hidden className="tabular text-sm text-muted-foreground">{readout}</span>
      </figcaption>
      <div role="img" aria-label={summary} onPointerLeave={() => setActive(null)} className="flex h-40 items-end gap-px border-b border-border sm:gap-0.5">
        {data.map((datum, index) => (
          <div key={datum.key} onPointerEnter={() => setActive(index)} className="flex h-full min-w-0 flex-1 items-end">
            <div
              className={cn("w-full rounded-t-sm opacity-80 transition-opacity", barClassName, active === index && "opacity-100")}
              style={{ height: datum.value > 0 && peak > 0 ? `${Math.max(MIN_BAR_PERCENT, (datum.value / peak) * FULL_PERCENT)}%` : "0%" }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden className="flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.label}</span>
        <span>{data.length > 1 ? data[data.length - 1].label : null}</span>
      </div>
    </figure>
  );
}
