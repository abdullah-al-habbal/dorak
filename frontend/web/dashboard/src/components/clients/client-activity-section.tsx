"use client";

import type { JSX } from "react";

import { useClientBookings } from "@/hooks/bookings/use-client-bookings";
import { useClientReviews } from "@/hooks/clients/reviews/use-client-reviews";
import { useI18n } from "@/hooks/core/state/use-i18n";

/** The client's latest bookings and the reviews they wrote (D4 allows nothing beyond these). */
export function ClientActivitySection({ clientId }: { clientId: string }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { clients: t, bookings } = dictionary;
  const bookingsQuery = useClientBookings(clientId);
  const reviewsQuery = useClientReviews(clientId);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const statusLabel = (status: string): string => (status in bookings.status ? bookings.status[status as keyof typeof bookings.status] : status);

  return (
    <>
      <section aria-label={t.detail.bookings} className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">{t.detail.bookings}</h3>
        {bookingsQuery.isPending ? <p className="text-sm text-muted-foreground">{t.detail.loading}</p> : null}
        {bookingsQuery.isError ? <p role="alert" className="text-sm text-destructive">{t.detail.loadFailed}</p> : null}
        {bookingsQuery.data && bookingsQuery.data.length === 0 ? <p className="text-sm text-muted-foreground">{t.detail.noBookings}</p> : null}
        <ul className="flex flex-col gap-1.5">
          {bookingsQuery.data?.map((booking) => (
            <li key={booking.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="tabular">{date.format(new Date(booking.starts_at))}</span>
              <span className="text-muted-foreground">{statusLabel(booking.booking_status)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label={t.detail.reviews} className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">{t.detail.reviews}</h3>
        {reviewsQuery.isPending ? <p className="text-sm text-muted-foreground">{t.detail.loading}</p> : null}
        {reviewsQuery.isError ? <p role="alert" className="text-sm text-destructive">{t.detail.loadFailed}</p> : null}
        {reviewsQuery.data && reviewsQuery.data.length === 0 ? <p className="text-sm text-muted-foreground">{t.detail.noReviews}</p> : null}
        <ul className="flex flex-col gap-1.5">
          {reviewsQuery.data?.map((review) => (
            <li key={review.id} className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="font-medium">
                <span dir="auto">{review.subject_name ?? t.none}</span>
                <span className="tabular text-muted-foreground">{` · ${review.rating}/5`}</span>
              </span>
              {review.body ? <span dir="auto" className="break-words text-muted-foreground">{review.body}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
