import type { JSX } from "react";

import { BarChart } from "@/components/earnings/bar-chart";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import type { BarChartDatum } from "@/interfaces/ui/data/bar-chart-datum.interface";
import type { EarningsBucket } from "@/interfaces/earnings/earnings-bucket.interface";
import { formatPrice } from "@/lib/core/format/booking-format.util";
import { formatCount, formatShortDate } from "@/lib/earnings/earnings-format.util";

interface EarningsChartsProps {
  buckets: readonly EarningsBucket[];
  currency: string;
  locale: string;
}

/** Revenue and completed bookings over the period, one bar per day (per week for long periods). */
export function EarningsCharts({ buckets, currency, locale }: EarningsChartsProps): JSX.Element {
  const { earnings: t } = useDictionary();
  const weekly = buckets.length > 0 && buckets[0].start !== buckets[0].end;
  const unit = weekly ? t.chart.units.week : t.chart.units.day;
  const labelFor = (bucket: EarningsBucket): string =>
    weekly ? t.chart.weekOf.replace("{date}", formatShortDate(bucket.start, locale)) : formatShortDate(bucket.start, locale);

  const revenue: BarChartDatum[] = buckets.map((bucket) => ({
    key: bucket.start,
    label: labelFor(bucket),
    value: bucket.gross_minor,
    valueLabel: formatPrice(bucket.gross_minor, currency, locale),
  }));
  const bookings: BarChartDatum[] = buckets.map((bucket) => ({
    key: bucket.start,
    label: labelFor(bucket),
    value: bucket.bookings,
    valueLabel: formatCount(bucket.bookings, locale),
  }));

  const revenueTotal = buckets.reduce((sum, bucket) => sum + bucket.gross_minor, 0);
  const bookingsTotal = buckets.reduce((sum, bucket) => sum + bucket.bookings, 0);
  const revenueTitle = t.chart.revenueTitle.replace("{unit}", unit);
  const bookingsTitle = t.chart.bookingsTitle.replace("{unit}", unit);
  const peakOf = (data: readonly BarChartDatum[]): string => {
    const peak = data.reduce((best, datum) => (datum.value > best.value ? datum : best), data[0]);
    return peak.valueLabel;
  };
  const summary = (title: string, total: string, data: readonly BarChartDatum[]): string =>
    t.chart.summary.replace("{title}", title).replace("{total}", total).replace("{count}", String(data.length)).replace("{unit}", unit).replace("{peak}", peakOf(data));

  if (buckets.length === 0) return <></>;
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <BarChart
        title={revenueTitle}
        summary={summary(revenueTitle, formatPrice(revenueTotal, currency, locale), revenue)}
        data={revenue}
        barClassName="bg-primary"
        idleReadout={formatPrice(revenueTotal, currency, locale)}
      />
      <BarChart
        title={bookingsTitle}
        summary={summary(bookingsTitle, formatCount(bookingsTotal, locale), bookings)}
        data={bookings}
        barClassName="bg-chart-2"
        idleReadout={formatCount(bookingsTotal, locale)}
      />
    </div>
  );
}
