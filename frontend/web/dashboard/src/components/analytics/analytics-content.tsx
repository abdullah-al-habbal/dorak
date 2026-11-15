"use client";

import type { JSX } from "react";

import { AnalyticsBookings } from "@/components/analytics/analytics-bookings";
import { AnalyticsMoney } from "@/components/analytics/analytics-money";
import { AnalyticsPlans } from "@/components/analytics/analytics-plans";
import { AnalyticsPlatformStats } from "@/components/analytics/analytics-platform-stats";
import { ErrorState } from "@/components/common/error-state";
import { EarningsRangePicker } from "@/components/earnings/earnings-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { useEarningsRange } from "@/hooks/earnings/use-earnings-range";
import { useI18n } from "@/hooks/core/use-i18n";
import { usePlatformAnalytics } from "@/hooks/platform/use-platform-analytics";

export function AnalyticsContent(): JSX.Element {
  const { locale } = useI18n();
  const { analytics: t } = useDictionary();
  const { range, today, setRange } = useEarningsRange();
  const query = usePlatformAnalytics(range);
  const analytics = query.data;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>
      <EarningsRangePicker range={range} today={today} onChange={setRange} />

      <div aria-busy={query.isFetching} className="flex flex-col gap-8">
        {query.isPending ? <AnalyticsSkeleton label={t.states.loading} /> : null}
        {query.isError && !analytics ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {analytics ? (
          <>
            <AnalyticsBookings analytics={analytics} range={range} locale={locale} />
            <AnalyticsMoney analytics={analytics} locale={locale} />
            <AnalyticsPlans plans={analytics.subscriptions.by_plan} locale={locale} />
            <AnalyticsPlatformStats platform={analytics.platform} locale={locale} />
          </>
        ) : null}
      </div>
    </div>
  );
}

function AnalyticsSkeleton({ label }: { label: string }): JSX.Element {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-4">
      <Skeleton className="h-56 w-full" />
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
