import type { JSX } from "react";

import { MeterRow } from "@/components/analytics/meter-row";
import { Card } from "@/components/ui/card";
import { useDictionary } from "@/hooks/use-dictionary";
import { formatCount } from "@/lib/earnings-format.util";
import type { PlatformAnalytics } from "@/types/platform-analytics.type";

/** Live brand subscriptions (active or past due) per plan. */
export function AnalyticsPlans({ plans, locale }: { plans: PlatformAnalytics["subscriptions"]["by_plan"]; locale: string }): JSX.Element {
  const { analytics: t } = useDictionary();
  const total = plans.reduce((sum, plan) => sum + plan.subscriptions, 0);
  return (
    <section aria-labelledby="analytics-plans" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 id="analytics-plans" className="font-heading text-lg font-semibold">{t.plans.title}</h2>
        <p className="text-xs text-muted-foreground">{t.plans.caption}</p>
      </div>
      <Card className="p-(--card-spacing)">
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.plans.none}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {plans.map((plan) => (
              <MeterRow key={plan.plan_id} label={plan.plan_name} valueLabel={formatCount(plan.subscriptions, locale)} value={plan.subscriptions} total={total} />
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
