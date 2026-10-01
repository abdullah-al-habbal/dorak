'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookingActionsDialog } from '@/features/bookings/components/dialogs/booking-actions-dialog';
import { useBookings } from '@/features/bookings/hooks';
import type { BookingListProps } from '@/features/bookings/types/components';
import { useChairs } from '@/features/chairs/hooks';
import { useStylists } from '@/features/stylists/hooks';
import { Input } from '@/shared/components/forms/input';
import { GenericTableListPage } from '@/shared/components/templates/generic-table-list-page';
import { useServerQueryParams } from '@/shared/hooks/use-server-query-params';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Canceled', value: 'canceled' },
] as const;

export function BookingList({ area }: Readonly<BookingListProps>) {
  const params = useServerQueryParams();
  const searchParams = useSearchParams();
  const filters = {
    chair_id: searchParams.get('chair_id') ?? undefined,
    date_from: searchParams.get('date_from') ?? undefined,
    date_to: searchParams.get('date_to') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    stylist_id: searchParams.get('stylist_id') ?? undefined,
  };
  const bookings = useBookings({ ...params, ...filters });
  const chairs = useChairs({ page: 1, per_page: 100 });
  const stylists = useStylists({ page: 1, per_page: 100 });
  const page = bookings.data;

  return (
    <GenericTableListPage
      actions={
        <Link
          className="rounded-lg bg-primary px-3 py-2 text-sm text-background"
          href={APP_ROUTES.create(area, 'bookings')}
        >
          Create walk-in booking
        </Link>
      }
      description="Monitor appointments and resolve cancellations or schedule changes."
      emptyMessage="No bookings match these filters."
      filters={
        <div className="flex flex-wrap items-end gap-2">
          <div aria-label="Booking status" className="flex flex-wrap gap-1" role="group">
            {statusFilters.map(({ label, value }) => (
              <button
                aria-pressed={(filters.status ?? '') === value}
                className="rounded-lg border px-3 py-2 text-sm aria-pressed:bg-primary aria-pressed:text-background"
                key={value || 'all'}
                onClick={() => params.setValue('status', value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <label className="grid gap-1 text-sm">
            From
            <Input
              aria-label="Start date"
              onChange={(event) => params.setValue('date_from', event.target.value)}
              type="date"
              value={filters.date_from ?? ''}
            />
          </label>
          <label className="grid gap-1 text-sm">
            To
            <Input
              aria-label="End date"
              onChange={(event) => params.setValue('date_to', event.target.value)}
              type="date"
              value={filters.date_to ?? ''}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Chair
            <select
              className="rounded-lg border bg-surface px-3 py-2"
              onChange={(event) => params.setValue('chair_id', event.target.value)}
              value={filters.chair_id ?? ''}
            >
              <option value="">All chairs</option>
              {chairs.data?.items.map((chair) => (
                <option key={chair.id} value={chair.id}>
                  {chair.label ?? chair.id}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Stylist
            <select
              className="rounded-lg border bg-surface px-3 py-2"
              onChange={(event) => params.setValue('stylist_id', event.target.value)}
              value={filters.stylist_id ?? ''}
            >
              <option value="">All stylists</option>
              {stylists.data?.items.map((stylist) => (
                <option key={stylist.id} value={stylist.id}>
                  {stylist.name.en}
                </option>
              ))}
            </select>
          </label>
        </div>
      }
      isEmpty={page?.items.length === 0}
      isLoading={bookings.isLoading}
      onPageChange={params.setPage}
      onSearchChange={params.setSearch}
      pagination={
        page === undefined
          ? undefined
          : { currentPage: page.pagination.currentPage, totalPages: page.pagination.totalPages }
      }
      search={params.search ?? ''}
      title="Bookings"
    >
      <div className="overflow-x-auto rounded-lg border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3">Time</th>
              <th className="p-3">Status</th>
              <th className="p-3">Chair</th>
              <th className="p-3">Stylist</th>
              <th className="p-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {page?.items.map((booking) => (
              <tr className="border-b" key={booking.id}>
                <td className="p-3">{formatBookingTime(booking.time_slot)}</td>
                <td className="p-3 capitalize">{booking.status.replace('_', ' ')}</td>
                <td className="p-3">{booking.chair?.label ?? '—'}</td>
                <td className="p-3">{booking.barber?.name.en ?? '—'}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link
                      className="underline"
                      href={APP_ROUTES.show(area, 'bookings', booking.id)}
                    >
                      View
                    </Link>
                    <BookingActionsDialog bookingId={booking.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GenericTableListPage>
  );
}

function formatBookingTime(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
