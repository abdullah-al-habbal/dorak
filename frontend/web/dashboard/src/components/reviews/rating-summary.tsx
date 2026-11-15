"use client";

import type { JSX } from "react";

import { RatingStars } from "@/components/reviews/rating-stars";
import { Card, CardContent } from "@/components/ui/card";
import { REVIEW_MAX_RATING } from "@/config/venue/review.constant";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { ratingBars } from "@/lib/clients/review-summary.util";
import type { ReviewSummary } from "@/types/clients/reviews/review-summary.type";

export function RatingSummary({ summary }: { summary: ReviewSummary }): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { reviews: t } = dictionary;
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const average = summary.average;

  return (
    <section aria-label={t.summary.title} className="grid gap-4 md:grid-cols-[minmax(0,16rem)_1fr]">
      <Card size="sm">
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{t.summary.average}</p>
          <p className="tabular font-heading text-4xl font-semibold" data-testid="rating-average">
            {average === null ? t.summary.none : number.format(average)}
          </p>
          {average !== null ? <RatingStars rating={Math.round(average)} label={t.rating.replace("{rating}", number.format(average)).replace("{max}", String(REVIEW_MAX_RATING))} /> : null}
          <p className="tabular text-sm text-muted-foreground">{t.summary.count.replace("{count}", String(summary.count))}</p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <ul className="flex flex-col gap-2" aria-label={t.summary.distribution}>
            {ratingBars(summary).map((bar) => (
              <li key={bar.rating} className="flex items-center gap-3 text-sm">
                <span className="tabular w-16 shrink-0 text-muted-foreground">{t.summary.stars.replace("{rating}", String(bar.rating))}</span>
                <span aria-hidden className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${bar.percent}%` }} />
                </span>
                <span className="tabular w-8 shrink-0 text-end">{bar.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
