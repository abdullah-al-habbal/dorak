"use client";

import type { JSX } from "react";

import { useI18n } from "@/hooks/core/state/use-i18n";
import { useReviews } from "@/hooks/clients/reviews/use-reviews";

const FIRST_PAGE = 1;

/** The branch's latest reviews and rating summary, read-only. */
export function BranchOversightReviews({ branchId }: { branchId: string }): JSX.Element {
  const { dictionary } = useI18n();
  const { branchOversight: t } = dictionary;
  const query = useReviews(branchId, FIRST_PAGE);
  const summary = query.data?.summary;

  return (
    <section aria-label={t.reviews.title} className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{t.reviews.title}</h3>
      {query.isError ? <p role="alert" className="text-sm text-destructive">{t.loadFailed}</p> : null}
      {summary ? (
        <p className="tabular text-sm text-muted-foreground">
          {summary.average === null ? t.reviews.none : t.reviews.summary.replace("{average}", summary.average.toFixed(1)).replace("{count}", String(summary.count))}
        </p>
      ) : null}
      <ul className="flex flex-col gap-1.5">
        {query.data?.items.map((review) => (
          <li key={review.id} className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2 text-sm">
            <span className="font-medium">
              <span dir="auto">{review.author_name ?? t.none}</span>
              <span className="tabular text-muted-foreground">{` · ${review.rating}/5`}</span>
            </span>
            {review.body ? <span dir="auto" className="break-words text-muted-foreground">{review.body}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
