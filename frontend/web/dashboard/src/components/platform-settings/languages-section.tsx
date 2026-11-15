"use client";

import type { JSX } from "react";

import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { useAdminLanguages } from "@/hooks/platform/settings/use-admin-languages";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useSetLanguageActive } from "@/hooks/platform/settings/use-set-language-active";
import { localizedText } from "@/lib/core/format/booking-format.util";

/** The languages the platform has translations for: switched on or off here, never added (a new one needs translations in code). */
export function LanguagesSection(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const t = dictionary.settings.languages;
  const query = useAdminLanguages();
  const toggle = useSetLanguageActive();
  const items = query.data ?? [];

  return (
    <section aria-labelledby="languages-heading" className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-1">
        <h2 id="languages-heading" className="font-heading text-xl font-semibold">{t.title}</h2>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>
      <div aria-busy={query.isFetching}>
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.errorTitle} body={t.errorBody} onRetry={() => query.refetch()} /> : null}
        {items.length > 0 ? (
          <ul aria-label={t.title} className="flex flex-col divide-y divide-border">
            {items.map((language) => (
              <li key={language.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="flex flex-wrap items-center gap-2">
                  <span dir="auto" className="font-medium">{localizedText(language.name, locale)}</span>
                  <span dir="ltr" className="tabular text-sm text-muted-foreground">{language.code}</span>
                  {language.is_default ? <Badge variant="info">{t.default}</Badge> : null}
                </span>
                <Switch
                  checked={language.is_active}
                  disabled={toggle.isPending || (language.is_default && language.is_active)}
                  aria-label={(language.is_active ? t.switchOff : t.switchOn).replace("{name}", localizedText(language.name, locale))}
                  onCheckedChange={(checked) => toggle.mutate({ id: language.id, active: checked })}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
