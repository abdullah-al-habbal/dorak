"use client";

import { useState } from "react";
import type { JSX } from "react";

import { CurrencySwitch } from "@/components/earnings/currency-switch";
import { EarningsCharts } from "@/components/earnings/earnings-charts";
import { EarningsDailyTable } from "@/components/earnings/earnings-daily-table";
import { EarningsExportButton } from "@/components/earnings/earnings-export-button";
import { EarningsHero } from "@/components/earnings/earnings-hero";
import { EarningsRangePicker } from "@/components/earnings/earnings-range-picker";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { useEarnings } from "@/hooks/earnings/use-earnings";
import { useEarningsRange } from "@/hooks/earnings/use-earnings-range";
import { useI18n } from "@/hooks/core/use-i18n";
import { currencyCodes, totalFor } from "@/lib/earnings-metrics.util";
import { chartBuckets, dailyBuckets } from "@/lib/earnings-series.util";

const DESCRIPTION_KEY = { [AuthActor.Barber]: "barber", [AuthActor.Owner]: "brand" } as const;

export function EarningsContent({ actor }: { actor: AuthActor }): JSX.Element {
  const { locale } = useI18n();
  const { earnings: t } = useDictionary();
  const { range, today, setRange } = useEarningsRange();
  const query = useEarnings(range);
  const [picked, setPicked] = useState<string | null>(null);

  const earnings = query.data;
  const codes = earnings ? currencyCodes(earnings) : [];
  const currency = picked !== null && codes.includes(picked) ? picked : (codes[0] ?? "");
  const description = t.descriptions[DESCRIPTION_KEY[actor as keyof typeof DESCRIPTION_KEY] ?? "branch"];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
          <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
        </div>
        <EarningsExportButton earnings={earnings} range={range} />
      </div>

      <EarningsRangePicker range={range} today={today} onChange={setRange} />

      {query.isPending ? <LoadingSkeleton /> : null}
      {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => void query.refetch()} /> : null}
      {earnings && codes.length === 0 ? <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} /> : null}
      {earnings && codes.length > 0 ? (
        <>
          <CurrencySwitch codes={codes} value={currency} onChange={setPicked} />
          <EarningsHero
            earnings={earnings}
            current={totalFor(earnings.totals, currency)}
            previous={totalFor(earnings.previous_totals, currency)}
            currency={currency}
            locale={locale}
          />
          <EarningsCharts buckets={chartBuckets(earnings.series, currency, range)} currency={currency} locale={locale} />
          <EarningsDailyTable days={dailyBuckets(earnings.series, currency, range)} currency={currency} locale={locale} />
        </>
      ) : null}
    </div>
  );
}

function LoadingSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-44 w-full rounded-2xl motion-reduce:animate-none" />
      <Skeleton className="h-40 w-full rounded-2xl motion-reduce:animate-none" />
      <TableSkeleton rows={4} />
    </div>
  );
}
