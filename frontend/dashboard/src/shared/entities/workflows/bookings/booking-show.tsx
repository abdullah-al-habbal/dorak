'use client';

import { CardSkeleton } from '@/shared/components/feedback/skeletons/card-skeleton';
import { GenericShowPage } from '@/shared/components/templates/generic-show-page';
import { bookingsConfig } from '@/shared/entities/configs/bookings.config';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import { BookingActionsDialog } from './booking-actions-dialog';

const bookingHooks = createEntityHooks(bookingsConfig);

export function BookingShow({ id }: Readonly<{ area: DashboardArea; id: string }>) {
  const booking = bookingHooks.useEntity(id);
  if (booking.data === undefined) {
    return <CardSkeleton />;
  }
  const item = booking.data;
  return (
    <GenericShowPage
      actions={<BookingActionsDialog bookingId={id} />}
      details={[
        { label: 'Status', value: item.status },
        { label: 'Start', value: item.timeSlot },
        { label: 'End', value: item.endsAt ?? '—' },
        { label: 'Chair', value: item.chair?.label ?? '—' },
        { label: 'Stylist', value: item.barber?.name.en ?? '—' },
        { label: 'Services', value: item.services.map((service) => service.name.en).join(', ') },
      ]}
      title="Booking"
    />
  );
}
