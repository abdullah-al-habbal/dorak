"use client";

import { useCallback, useMemo, useState } from "react";
import type { JSX } from "react";

import { BookingDetailDialog } from "@/components/bookings/booking-detail-dialog";
import { BookingGrid } from "@/components/bookings/booking-grid";
import { BookingList } from "@/components/bookings/booking-list";
import { BookingToolbar } from "@/components/bookings/booking-toolbar";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterChips } from "@/components/common/filter-chips";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { WEEK_START } from "@/config/week-start.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { BookingView } from "@/enums/booking-view.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useBookingFilters } from "@/hooks/use-booking-filters";
import { useBookingsQuery } from "@/hooks/use-bookings-query";
import { useChairOptions } from "@/hooks/use-chair-options";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { buildBookingChips, CLEAR_ALL_PATCH, patchForChip } from "@/lib/booking-chips.util";
import { localizedText } from "@/lib/booking-format.util";
import type { Booking } from "@/types/booking.type";

export function BookingsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor === AuthActor.Barber) {
    const { states } = dictionary.bookings;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <BookingsContent />;
}

function BookingsContent(): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { bookings: t } = dictionary;
  const { filters, update } = useBookingFilters();
  const overlay = useOverlay();
  const chairs = useChairOptions();
  const weekStart = WEEK_START[locale];
  const paged = filters.view === BookingView.List;
  const [selected, setSelected] = useState<Booking | null>(null);

  const query = useBookingsQuery(filters, weekStart);

  const chairLabel = useCallback(
    (id: string) => localizedText(chairs.data?.find((chair) => chair.id === id)?.label, locale) || id,
    [chairs.data, locale],
  );
  const chips = useMemo(() => buildBookingChips({ filters, dictionary, chairLabel }), [filters, dictionary, chairLabel]);
  const removeChip = useCallback((key: string) => update(patchForChip(key)), [update]);
  const clear = useCallback(() => update(CLEAR_ALL_PATCH), [update]);
  const openWalkIn = useCallback(() => overlay.open({ kind: OverlayKind.WalkIn }), [overlay]);
  const changePage = useCallback((page: number) => update({ page }), [update]);

  const items = query.data?.items ?? [];
  const page = query.data?.page;
  const filtered = chips.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      <BookingToolbar filters={filters} weekStart={weekStart} chairs={chairs.data ?? []} onChange={update} onNewWalkIn={openWalkIn} />
      <FilterChips chips={chips} onRemove={removeChip} onClearAll={clear} />

      {query.isError && items.length > 0 ? (
        <p role="status" className="rounded-lg bg-warning/15 px-3 py-2 text-sm">{t.states.stale}</p>
      ) : null}

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          filtered ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
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
            {paged && page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>

      <BookingDetailDialog booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
