'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GenericTableListPage } from '@/shared/components/templates/generic-table-list-page';
import { Input } from '@/shared/components/forms/input';
import { useServerQueryParams } from '@/shared/hooks/use-server-query-params';
import { APP_ROUTES, type DashboardArea } from '@/shared/routes/dashboard-routes';
import { BookingActionsDialog } from '@/features/bookings/components/dialogs/booking-actions-dialog';
import { useBookings } from '@/features/bookings/hooks/use-bookings';

const statuses = ['', 'pending', 'confirmed', 'in_progress', 'completed', 'canceled'] as const;
export function BookingList({ area }: Readonly<{ area: DashboardArea }>) { const params = useServerQueryParams(); const searchParams = useSearchParams(); const query = useBookings({ ...params, status: searchParams.get('status') ?? undefined }); const page = query.data; return <GenericTableListPage description="Monitor and manage booking lifecycle transitions." emptyMessage="No bookings found." filters={<div className="flex flex-wrap gap-2"><Input onChange={(event) => params.setValue('chair_id', event.target.value)} placeholder="Chair ID" />{statuses.map((status) => <button className="rounded-lg border px-3 py-2 text-sm" key={status || 'all'} onClick={() => params.setValue('status', status)} type="button">{status || 'All'}</button>)}</div>} isLoading={query.isLoading} onPageChange={params.setPage} onSearchChange={params.setSearch} pagination={page === undefined ? undefined : { currentPage: page.pagination.currentPage, totalPages: page.pagination.totalPages }} search={params.search ?? ''} title="Bookings"><div className="overflow-x-auto rounded-lg border bg-surface"><table className="w-full text-left text-sm"><tbody>{page?.items.map((booking) => <tr className="border-b" key={booking.id}><td className="p-3">{booking.time_slot}</td><td className="p-3">{booking.status}</td><td className="p-3">{booking.chair?.label ?? '—'}</td><td className="p-3"><Link className="underline" href={APP_ROUTES.show(area, 'bookings', booking.id)}>View</Link></td><td className="p-3"><BookingActionsDialog bookingId={booking.id} /></td></tr>)}</tbody></table></div></GenericTableListPage>; }
