"use client";

import { Card, CardContent } from "@/components/tailgrids/core/card";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { MONETIZATION_QUERY_KEYS } from "@/services/api/dashboard/monetization/monetization.constant";
import { getAnalytics } from "@/services/api/dashboard/monetization/monetization.query";
import { formatMinorUnits } from "@/services/api/dashboard/monetization/monetization.util";
import { useQuery } from "@tanstack/react-query";

interface ITotalsProps {
  title: string;
  rows: ReadonlyArray<{ currency: string; totalMinor: number }>;
}

function Totals({ title, rows }: ITotalsProps) {
  return (
    <Card>
      <CardContent className="space-y-1 pt-4 text-sm">
        <h2 className="font-semibold text-title-50">{title}</h2>
        {rows.length === 0 ? <p>—</p> : null}
        {rows.map((row) => (
          <p key={row.currency}>
            {formatMinorUnits(row.totalMinor, row.currency)}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.monetization;
  const analytics = useQuery({
    queryKey: MONETIZATION_QUERY_KEYS.analytics,
    queryFn: getAnalytics,
  });
  const data = analytics.data;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">
        {copy.analytics.title}
      </h1>
      {analytics.isPending ? (
        <p className="text-text-secondary">{copy.loading}</p>
      ) : null}
      {analytics.isError ? (
        <p role="alert">{apiErrorMessage(analytics.error, dictionary)}</p>
      ) : null}
      {data ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Totals
            title={copy.analytics.recurringRevenue}
            rows={data.recurringRevenue}
          />
          <Totals
            title={copy.analytics.commissionPending}
            rows={data.commissionPending}
          />
          <Totals
            title={copy.analytics.commissionSettled}
            rows={data.commissionSettled}
          />
          <Card>
            <CardContent className="space-y-1 pt-4 text-sm">
              <h2 className="font-semibold text-title-50">
                {copy.analytics.completedBookings}
              </h2>
              <p>{data.completedBookings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-1 pt-4 text-sm">
              <h2 className="font-semibold text-title-50">
                {copy.analytics.subscriptionsByPlan}
              </h2>
              {data.subscriptionsByPlan.map((row) => (
                <p key={row.planId}>
                  {row.planId}: {row.subscriptions}
                </p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-1 pt-4 text-sm">
              <h2 className="font-semibold text-title-50">
                {copy.analytics.payouts}
              </h2>
              {data.payouts.map((row) => (
                <p key={`${row.status}-${row.currency}`}>
                  {row.status}: {row.payouts} ·{" "}
                  {formatMinorUnits(row.totalMinor, row.currency)}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
