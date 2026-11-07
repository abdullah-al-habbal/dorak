import type { JSX } from "react";

import { Card } from "@/components/ui/card";
import { useDictionary } from "@/hooks/use-dictionary";
import { formatCount } from "@/lib/earnings-format.util";
import type { PlatformAnalytics } from "@/types/platform-analytics.type";

/** The live size of the platform. These figures ignore the period picker, and the caption says so. */
export function AnalyticsPlatformStats({ platform, locale }: { platform: PlatformAnalytics["platform"]; locale: string }): JSX.Element {
  const { analytics: t } = useDictionary();
  const stats = [
    { key: "brands", label: t.platform.brands, value: platform.brands },
    { key: "branches", label: t.platform.branches, value: platform.branches },
    { key: "barbers", label: t.platform.barbers, value: platform.barbers },
    { key: "clients", label: t.platform.clients, value: platform.clients },
  ];
  return (
    <section aria-labelledby="analytics-platform" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 id="analytics-platform" className="font-heading text-lg font-semibold">{t.platform.title}</h2>
        <p className="text-xs text-muted-foreground">{t.platform.caption}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.key} className="gap-1 p-4">
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="tabular font-heading text-3xl font-semibold">{formatCount(stat.value, locale)}</dd>
          </Card>
        ))}
      </dl>
    </section>
  );
}
