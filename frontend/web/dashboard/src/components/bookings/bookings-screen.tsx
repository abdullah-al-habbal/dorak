"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { BookingDetailDialog } from "@/components/bookings/booking-detail-dialog";
import { BookingGrid } from "@/components/bookings/booking-grid";
import { BookingList } from "@/components/bookings/booking-list";
import { BookingsEmpty, BookingsError, BookingsFilteredEmpty, BookingsForbidden, BookingsSkeleton } from "@/components/bookings/booking-states";
import { BookingToolbar } from "@/components/bookings/booking-toolbar";
import { Button } from "@/components/ui/button";
import { WEEK_START } from "@/config/week-start.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { BookingView } from "@/enums/booking-view.enum";
import { useBookingFilters } from "@/hooks/use-booking-filters";
import { useI18n } from "@/hooks/use-i18n";
import { bookingKeys } from "@/lib/booking-keys";
import { fetchBookingPage, fetchBookingWindow } from "@/services/api/query/bookings.query";
import type { Booking } from "@/types/booking.type";

export function BookingsScreen({ actor }: { actor: AuthActor }) {
  if (actor === AuthActor.Barber) return <BookingsForbidden />;
  return <BookingsContent />;
}

function BookingsContent() {
  const { locale, dictionary } = useI18n();
  const { bookings: t } = dictionary;
  const { filters, update } = useBookingFilters();
  const weekStart = WEEK_START[locale];
  const paged = filters.view === BookingView.List;
  const [selected, setSelected] = useState<Booking | null>(null);

  const query = useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: async () => {
      if (paged) return fetchBookingPage(filters, weekStart, filters.page);
      const items = await fetchBookingWindow(filters, weekStart);
      return { items, page: { total: items.length, per_page: items.length, current_page: 1, total_pages: 1 } };
    },
    placeholderData: keepPreviousData,
  });

  const clear = useCallback(() => update({ status: undefined, search: undefined, chairId: undefined }), [update]);
  const items = query.data?.items ?? [];
  const filtered = Boolean(filters.status || filters.search || filters.chairId);
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      <BookingToolbar filters={filters} weekStart={weekStart} onChange={update} />

      {query.isError && items.length > 0 ? (
        <p role="status" className="rounded-lg bg-warning/15 px-3 py-2 text-sm">{t.states.stale}</p>
      ) : null}

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <BookingsSkeleton /> : null}
        {query.isError && items.length === 0 ? <BookingsError onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? filtered ? <BookingsFilteredEmpty onClear={clear} /> : <BookingsEmpty /> : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">
              {t.states.results.replace("{count}", String(page?.total ?? items.length))}
            </p>
            {paged ? (
              <BookingList bookings={items} onSelect={setSelected} />
            ) : (
              <>
                <div className="md:hidden"><BookingList bookings={items} onSelect={setSelected} /></div>
                <div className="hidden md:block">
                  <BookingGrid bookings={items} view={filters.view as BookingView.Day | BookingView.Week} date={filters.date} weekStart={weekStart} onSelect={setSelected} />
                </div>
              </>
            )}
            {paged && page && page.total_pages > 1 ? (
              <nav className="flex items-center justify-between gap-3" aria-label={t.title}>
                <Button variant="outline" disabled={page.current_page <= 1} onClick={() => update({ page: page.current_page - 1 })}>{t.states.previousPage}</Button>
                <span className="tabular text-sm text-muted-foreground">
                  {t.states.page.replace("{page}", String(page.current_page)).replace("{total}", String(page.total_pages))}
                </span>
                <Button variant="outline" disabled={page.current_page >= page.total_pages} onClick={() => update({ page: page.current_page + 1 })}>{t.states.nextPage}</Button>
              </nav>
            ) : null}
          </>
        ) : null}
      </div>

      <BookingDetailDialog booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
