"use client";

import type { JSX } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useBookingHistory } from "@/hooks/use-booking-history";
import { useI18n } from "@/hooks/use-i18n";
import { actorLabel, statusLabel } from "@/lib/booking-status-label.util";

const SKELETON_ROWS = 3;

export function BookingHistoryTimeline({ bookingId }: { bookingId: string }): JSX.Element {
  const { locale, direction, dictionary } = useI18n();
  const arrow = direction === "rtl" ? "←" : "→";
  const { bookings: t, common } = dictionary;
  const history = useBookingHistory(bookingId);

  return (
    <section aria-labelledby="booking-history-title" className="flex flex-col gap-2 border-t border-border pt-4">
      <h3 id="booking-history-title" className="text-sm font-medium">{t.history.title}</h3>
      {history.isPending ? (
        <div role="status" aria-busy="true" aria-label={common.loading} className="flex flex-col gap-2">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => <Skeleton key={index} className="h-8 w-full motion-reduce:animate-none" />)}
        </div>
      ) : null}
      {history.isError ? (
        <div role="alert" className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>{t.history.error}</span>
          <Button variant="outline" size="sm" onClick={() => history.refetch()}>{common.retry}</Button>
        </div>
      ) : null}
      {history.data?.length === 0 ? <p className="text-sm text-muted-foreground">{t.history.empty}</p> : null}
      {history.data && history.data.length > 0 ? (
        <ol className="flex flex-col">
          {history.data.map((entry) => (
            <li key={entry.id} className="relative flex flex-col gap-0.5 border-s border-border-strong pb-3 ps-4 last:pb-0">
              <span aria-hidden className="absolute -start-[5px] top-1.5 size-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">
                {entry.from_status ? `${statusLabel(entry.from_status, dictionary)} ${arrow} ` : `${t.history.created}: `}
                {statusLabel(entry.to_status, dictionary)}
              </span>
              <span className="tabular text-xs text-muted-foreground">
                <time dateTime={entry.created_at}>
                  {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.created_at))}
                </time>
                {" · "}
                {actorLabel(entry.actor_type, dictionary)}
              </span>
              {entry.reason ? <span className="text-xs text-muted-foreground">{entry.reason}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
