import type { JSX } from "react";

import { MeterRow } from "@/components/analytics/meter-row";
import { BarChart } from "@/components/earnings/bar-chart";
import { Card } from "@/components/ui/card";
import { useDictionary } from "@/hooks/core/use-dictionary";
import type { BarChartDatum } from "@/interfaces/ui/bar-chart-datum.interface";
import { fillDailyCounts, sumCounts } from "@/lib/platform/analytics-series.util";
import { formatCount, formatShortDate } from "@/lib/earnings/earnings-format.util";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";
import type { PlatformAnalytics } from "@/types/platform/platform-analytics.type";

interface AnalyticsBookingsProps {
  analytics: PlatformAnalytics;
  range: EarningsRange;
  locale: string;
}

/** Completed bookings per day, beside the status mix of every booking that starts in the period. */
export function AnalyticsBookings({ analytics, range, locale }: AnalyticsBookingsProps): JSX.Element {
  const { analytics: t, bookings } = useDictionary();
  const days = fillDailyCounts(analytics.completed_bookings_series, range);
  const data: BarChartDatum[] = days.map((day) => ({ key: day.date, label: formatShortDate(day.date, locale), value: day.count, valueLabel: formatCount(day.count, locale) }));
  const total = formatCount(analytics.completed_bookings, locale);
  const statusTotal = sumCounts(analytics.bookings_by_status);
  const statusLabels: Record<string, string> = bookings.status;
  const peak = Math.max(...days.map((day) => day.count), 0);

  return (
    <section aria-labelledby="analytics-bookings" className="flex flex-col gap-3">
      <h2 id="analytics-bookings" className="font-heading text-lg font-semibold">{t.bookings.title}</h2>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="p-(--card-spacing)">
          {data.length === 0 || analytics.completed_bookings === 0 ? (
            <p className="text-sm text-muted-foreground">{t.bookings.noneCompleted}</p>
          ) : (
            <BarChart
              title={t.bookings.chartTitle}
              summary={t.bookings.summary.replace("{total}", total).replace("{count}", String(data.length)).replace("{peak}", formatCount(peak, locale))}
              data={data}
              barClassName="bg-primary"
              idleReadout={t.bookings.total.replace("{total}", total)}
            />
          )}
        </Card>
        <Card className="gap-3 p-(--card-spacing)">
          <h3 className="text-sm font-medium">{t.bookings.statusTitle}</h3>
          {analytics.bookings_by_status.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.bookings.noneInPeriod}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {analytics.bookings_by_status.map((entry) => (
                <MeterRow key={entry.status} label={statusLabels[entry.status] ?? entry.status} valueLabel={formatCount(entry.count, locale)} value={entry.count} total={statusTotal} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </section>
  );
}
