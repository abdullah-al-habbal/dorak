"use client";

import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Switch } from "@/components/ui/switch";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOnboardingConfigs, useUpdateOnboardingConfig } from "@/hooks/platform/use-website-content";
import type { OnboardingConfig } from "@/types/platform/website-content.type";

/** The onboarding hero per language and season; each can be switched on or off. */
export function OnboardingPanel(): JSX.Element {
  const { dictionary } = useI18n();
  const t = dictionary.content;
  const query = useOnboardingConfigs();
  const update = useUpdateOnboardingConfig();
  const items = query.data ?? [];

  function label(config: OnboardingConfig): string {
    const language = config.locale === "ar" ? t.onboarding.locale.ar : t.onboarding.locale.en;
    const season = t.onboarding.season[config.season as keyof typeof t.onboarding.season] ?? t.onboarding.defaultSeason;
    return `${language} · ${season}`;
  }

  return (
    <div aria-busy={query.isFetching} className="flex flex-col gap-4">
      <p className="max-w-prose text-sm text-muted-foreground">{t.onboarding.description}</p>
      {query.isPending ? <TableSkeleton /> : null}
      {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
      {query.data && items.length === 0 ? <EmptyState title={t.states.emptyOnboarding} body="" /> : null}
      {items.length > 0 ? (
        <ul aria-label={t.tabs.onboarding} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((config) => {
            const name = label(config);
            return (
              <li key={config.id} className="flex flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element -- an admin-managed storage URL of unknown size */}
                <img src={config.hero_image_url} alt={t.onboarding.imageAlt.replace("{label}", name)} loading="lazy" width={640} height={360} className="aspect-video w-full bg-muted object-cover" />
                <div className="flex items-center justify-between gap-3 p-3">
                  <span className="font-medium">{name}</span>
                  <Switch
                    checked={config.is_active}
                    disabled={update.isPending}
                    aria-label={(config.is_active ? t.onboarding.switchOff : t.onboarding.switchOn).replace("{label}", name)}
                    onCheckedChange={(checked) => update.mutate({ id: config.id, payload: { is_active: checked, sort_order: config.sort_order } })}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
