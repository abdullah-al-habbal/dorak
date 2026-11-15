import type { JSX, ReactNode } from "react";

import { TrendBadge } from "@/components/earnings/trend-badge";
import { Card } from "@/components/ui/card";
import { useDictionary } from "@/hooks/use-dictionary";
import { formatPrice } from "@/lib/booking-format.util";
import { averageTicket, computeTrend } from "@/lib/earnings-metrics.util";
import { formatCount, formatShortDate } from "@/lib/earnings-format.util";
import type { Earnings } from "@/types/earnings/earnings.type";
import type { EarningsTotal } from "@/types/earnings/earnings-total.type";

interface EarningsHeroProps {
  earnings: Earnings;
  current: EarningsTotal | null;
  previous: EarningsTotal | null;
  currency: string;
  locale: string;
}

function Stat({ label, children, hint }: { label: string; children: ReactNode; hint?: string }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd title={hint} className="tabular flex flex-wrap items-center justify-end gap-2 text-end font-semibold">{children}</dd>
    </div>
  );
}

/** Revenue leads at display size; the supporting figures sit in a quiet list beside it. */
export function EarningsHero({ earnings, current, previous, currency, locale }: EarningsHeroProps): JSX.Element {
  const { earnings: t } = useDictionary();
  const gross = current?.gross_minor ?? 0;
  const bookings = current?.completed_bookings_count ?? 0;
  const revenueTrend = earnings.previous_totals ? computeTrend(gross, previous?.gross_minor ?? 0) : null;
  const bookingsTrend = earnings.previous_totals ? computeTrend(bookings, previous?.completed_bookings_count ?? 0) : null;
  const ticket = averageTicket(current);
  const money = (minor: number): string => formatPrice(minor, currency, locale);
  const isBarber = earnings.scope === "barber";

  return (
    <Card className="grid gap-6 p-(--card-spacing) lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-10">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-sm text-muted-foreground">{t.revenue}</p>
        <p className="tabular font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{money(gross)}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {revenueTrend ? <TrendBadge trend={revenueTrend} locale={locale} /> : null}
          {earnings.previous_period ? (
            <span className="text-xs text-muted-foreground">
              {t.range.comparing.replace("{from}", formatShortDate(earnings.previous_period.from, locale)).replace("{to}", formatShortDate(earnings.previous_period.to, locale))}
            </span>
          ) : null}
        </div>
      </div>

      <dl className="flex min-w-0 flex-col divide-y divide-border">
        <Stat label={t.bookings}>
          {formatCount(bookings, locale)}
          {bookingsTrend ? <TrendBadge trend={bookingsTrend} locale={locale} /> : null}
        </Stat>
        <Stat label={t.averageTicket}>{ticket === null ? t.none : money(ticket)}</Stat>
        {isBarber ? null : <Stat label={t.commission}>{money(current?.commission_minor ?? 0)}</Stat>}
        <Stat label={t.net} hint={current?.net_minor == null ? t.netUnavailableHint : undefined}>
          {current?.net_minor == null ? <span className="font-normal text-muted-foreground">{t.netUnavailable}</span> : money(current.net_minor)}
        </Stat>
      </dl>
    </Card>
  );
}
