import type { JSX } from "react";

import { Card } from "@/components/ui/card";
import { useDictionary } from "@/hooks/use-dictionary";
import { currencyRows } from "@/lib/analytics-money.util";
import { formatPrice } from "@/lib/booking-format.util";
import { formatCount } from "@/lib/earnings-format.util";
import type { PlatformAnalytics } from "@/types/platform-analytics.type";

/** Recurring revenue, commission and payouts, one block per currency: amounts are never converted between currencies. */
export function AnalyticsMoney({ analytics, locale }: { analytics: PlatformAnalytics; locale: string }): JSX.Element {
  const { analytics: t, payouts } = useDictionary();
  const rows = currencyRows(analytics.subscriptions.recurring_revenue, analytics.commission.pending, analytics.commission.settled);
  const statusLabels: Record<string, string> = payouts.status;

  return (
    <section aria-labelledby="analytics-money" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 id="analytics-money" className="font-heading text-lg font-semibold">{t.money.title}</h2>
        <p className="text-xs text-muted-foreground">{t.money.caption}</p>
      </div>
      {rows.length === 0 ? (
        <Card className="p-(--card-spacing)"><p className="text-sm text-muted-foreground">{t.money.none}</p></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => (
            <Card key={row.currency} className="gap-3 p-(--card-spacing)">
              <h3 className="font-heading text-base font-semibold">{row.currency}</h3>
              <dl className="flex flex-col divide-y divide-border text-sm">
                <Figure label={t.money.recurring} value={formatPrice(row.recurring, row.currency, locale)} />
                <Figure label={t.money.pending} value={formatPrice(row.pending, row.currency, locale)} />
                <Figure label={t.money.settled} value={formatPrice(row.settled, row.currency, locale)} />
                {analytics.payouts.filter((payout) => payout.currency === row.currency).map((payout) => (
                  <Figure
                    key={payout.status}
                    label={t.money.payoutLine.replace("{status}", statusLabels[payout.status] ?? payout.status).replace("{count}", formatCount(payout.payouts, locale))}
                    value={formatPrice(payout.total_amount_minor, row.currency, locale)}
                  />
                ))}
              </dl>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function Figure({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular text-end font-semibold">{value}</dd>
    </div>
  );
}
