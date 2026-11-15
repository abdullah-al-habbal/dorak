"use client";

import type { JSX } from "react";

import { FeatureList } from "@/components/subscription/feature-list";
import { SubscriptionStatusBadge } from "@/components/subscription/subscription-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionStatus } from "@/enums/money/subscription-status.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { formatPrice, localizedText } from "@/lib/core/format/booking-format.util";
import { intervalLabel } from "@/lib/plans/subscription-format.util";
import type { Subscription } from "@/types/plans/subscription.type";

export function SubscriptionCard({ subscription }: { subscription: Subscription }): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { subscription: t } = dictionary;
  const { plan } = subscription;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const day = (iso: string | null | undefined): string => (iso ? date.format(new Date(iso)) : t.dates.none);
  const price = t.price
    .replace("{price}", formatPrice(plan.price_amount_minor, plan.currency_code, locale))
    .replace("{interval}", intervalLabel(plan.interval_unit, plan.interval_count, t.interval));
  const description = localizedText(plan.description, locale);
  const pastDue = subscription.status === SubscriptionStatus.PastDue;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p dir="auto" className="text-sm text-muted-foreground">{localizedText(subscription.brand.name, locale)}</p>
            <h2 dir="auto" className="font-heading text-2xl font-semibold">{localizedText(plan.name, locale)}</h2>
          </div>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>

        <p className="tabular font-heading text-3xl font-semibold" data-testid="plan-price">{price}</p>
        {description ? <p dir="auto" className="max-w-prose text-sm text-muted-foreground">{description}</p> : null}

        {pastDue ? (
          <p role="status" className="rounded-lg bg-warning/15 px-3 py-2 text-sm">
            {subscription.grace_ends_at ? t.pastDue.replace("{date}", day(subscription.grace_ends_at)) : t.pastDueNoGrace}
          </p>
        ) : null}

        <dl className="tabular grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          <dt className="text-muted-foreground">{t.dates.starts}</dt>
          <dd>{day(subscription.starts_at)}</dd>
          <dt className="text-muted-foreground">{t.dates.ends}</dt>
          <dd>{day(subscription.ends_at)}</dd>
          {subscription.cancelled_at ? (
            <>
              <dt className="text-muted-foreground">{t.dates.cancelled}</dt>
              <dd>{day(subscription.cancelled_at)}</dd>
            </>
          ) : null}
        </dl>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{t.features.title}</h3>
          <FeatureList features={subscription.features} />
        </div>
      </CardContent>
    </Card>
  );
}
