'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GenericTableListPage } from '@/shared/components/templates/generic-table-list-page';
import { bookingsConfig } from '@/shared/entities/configs/bookings.config';
import { chairsConfig } from '@/shared/entities/configs/chairs.config';
import { stylistsConfig } from '@/shared/entities/configs/stylists.config';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import { useServerQueryParams } from '@/shared/hooks/use-server-query-params';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';
import { BookingActionsDialog } from './booking-actions-dialog';

const bookingHooks = createEntityHooks(bookingsConfig);
const chairHooks = createEntityHooks(chairsConfig);
const stylistHooks = createEntityHooks(stylistsConfig);

export function BookingList({ area }: Readonly<{ area: DashboardArea }>) {
  const params = useServerQueryParams();
  const searchParams = useSearchParams();
  const bookings = bookingHooks.useEntities({
    ...params,
    chairId: searchParams.get('chair_id') ?? undefined,
    dateFrom: searchParams.get('date_from') ?? undefined,
    dateTo: searchParams.get('date_to') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    stylistId: searchParams.get('stylist_id') ?? undefined,
  });
  const chairs = chairHooks.useEntities({ page: 1, per_page: 100 });
  const stylists = stylistHooks.useEntities({ page: 1, per_page: 100 });
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
        <div className="flex flex-wrap gap-2">
          <select
            onChange={(event) => params.setValue('chair_id', event.target.value)}
            value={searchParams.get('chair_id') ?? ''}
          >
            <option value="">All chairs</option>
            {chairs.data?.items.map((chair) => (
              <option key={chair.id} value={chair.id}>
                {chair.label ?? chair.id}
              </option>
            ))}
          </select>
          <select
            onChange={(event) => params.setValue('stylist_id', event.target.value)}
            value={searchParams.get('stylist_id') ?? ''}
          >
            <option value="">All stylists</option>
            {stylists.data?.items.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.name.en}
              </option>
            ))}
          </select>
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
          <tbody>
            {page?.items.map((booking) => (
              <tr className="border-b" key={booking.id}>
                <td className="p-3">{booking.timeSlot}</td>
                <td className="p-3">{booking.status}</td>
                <td className="p-3">{booking.chair?.label ?? '—'}</td>
                <td className="p-3">{booking.barber?.name.en ?? '—'}</td>
                <td className="p-3">
                  <Link className="underline" href={APP_ROUTES.show(area, 'bookings', booking.id)}>
                    View
                  </Link>
                  <BookingActionsDialog bookingId={booking.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GenericTableListPage>
  );
}
