'use client';

import { useBookings } from '@/features/bookings/hooks';
import { useChairs } from '@/features/chairs/hooks';
import { useOverview } from '@/features/overview/hooks';
import { CardSkeleton } from '@/shared/components/feedback/skeletons/card-skeleton';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';

export function OverviewDashboard() {
  const { t } = useDashboardTranslation();
  const overview = useOverview();
  const today = new Date().toISOString().slice(0, 10);
  const chairs = useChairs({ page: 1, per_page: 100 });
  const bookings = useBookings({ date_from: today, date_to: today, page: 1, per_page: 100 });
  if (overview.data === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }
  const labels = [
    [t('overview.todayBookings'), 'today_bookings_count'],
    [t('overview.activeChairs'), 'active_chairs_count'],
    [t('overview.activeStylists'), 'stylists_count'],
    [t('overview.revenue'), 'revenue'],
  ] as const;
  const occupancyLabel = {
    available: t('overview.available'),
    maintenance: t('overview.maintenance'),
    occupied: t('overview.busy'),
  } as const;
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('overview.overview')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {labels.map(([label, key]) => (
          <article className="rounded-lg border bg-surface p-5" key={key}>
            <p className="text-sm">{label}</p>
            <p className="mt-2 text-2xl font-semibold">
              {key === 'revenue' ? formatRevenue(overview.data[key]) : overview.data[key]}
            </p>
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border bg-surface p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-semibold">{t('overview.chairOccupancy')}</h2>
            <span className="text-sm">
              {chairs.data?.items.length ?? 0} {t('overview.chairs')}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {chairs.data?.items.map((chair) => (
              <article className="rounded-lg border p-3" key={chair.id}>
                <p className="font-medium">{chair.label ?? t('overview.unnamedChair')}</p>
                <p className="mt-1 text-sm">{occupancyLabel[chair.status]}</p>
              </article>
            ))}
            {chairs.data?.items.length === 0 ? (
              <p className="col-span-full text-sm">{t('overview.noChairs')}</p>
            ) : null}
          </div>
        </section>
        <section className="rounded-lg border bg-surface p-5">
          <h2 className="font-semibold">{t('overview.schedule')}</h2>
          <ol className="mt-4 space-y-3">
            {bookings.data?.items.map((booking) => (
              <li className="flex justify-between gap-3 border-b pb-3" key={booking.id}>
                <div>
                  <p className="font-medium">
                    {booking.barber?.name.en ?? booking.chair?.label ?? t('bookings.appointment')}
                  </p>
                  <p className="text-sm">
                    {booking.services.map((service) => service.name.en).join(', ') ||
                      t('bookings.noService')}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>{formatTime(booking.time_slot)}</p>
                  <p className="capitalize">{statusLabel(t, booking.status)}</p>
                </div>
              </li>
            ))}
            {bookings.data?.items.length === 0 ? (
              <li className="text-sm">{t('overview.noSchedule')}</li>
            ) : null}
          </ol>
        </section>
      </div>
    </section>
  );
}

function formatRevenue(value: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
}
function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
}
function statusLabel(t: ReturnType<typeof useDashboardTranslation>['t'], status: string): string {
  return t(
    (
      {
        pending: 'bookings.statusPending',
        confirmed: 'bookings.statusConfirmed',
        in_progress: 'bookings.statusInProgress',
        completed: 'bookings.statusCompleted',
        canceled: 'bookings.statusCanceled',
        no_show: 'bookings.statusNoShow',
      } as const
    )[status as 'pending'],
  );
}
