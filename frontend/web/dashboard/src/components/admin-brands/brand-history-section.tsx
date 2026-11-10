"use client";

import type { JSX } from "react";

import { useI18n } from "@/hooks/use-i18n";
import { useStatusHistory } from "@/hooks/use-status-history";

const BRAND_SUBJECT = "brand";

/** Every approval decision on a brand, newest first, with the reason and who decided. */
export function BrandHistorySection({ brandId }: { brandId: string }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminBrands: t } = dictionary;
  const query = useStatusHistory(BRAND_SUBJECT, brandId);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const label = (status: string): string => (status in t.status ? t.status[status as keyof typeof t.status] : status);

  return (
    <section aria-label={t.history.title} className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{t.history.title}</h3>
      {query.isPending ? <p className="text-sm text-muted-foreground">{t.history.loading}</p> : null}
      {query.isError ? <p role="alert" className="text-sm text-destructive">{t.history.failed}</p> : null}
      {query.data && query.data.length === 0 ? <p className="text-sm text-muted-foreground">{t.history.empty}</p> : null}
      {query.data && query.data.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {query.data.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="font-medium">
                {entry.from_status ? `${label(entry.from_status)} → ` : ""}
                {label(entry.to_status)}
              </span>
              <span className="tabular text-xs text-muted-foreground">
                {entry.created_at ? date.format(new Date(entry.created_at)) : t.none}
                {" · "}
                {t.history.actors[entry.actor_type as keyof typeof t.history.actors] ?? entry.actor_type}
              </span>
              {entry.reason ? <span dir="auto" className="break-words text-muted-foreground">{entry.reason}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
