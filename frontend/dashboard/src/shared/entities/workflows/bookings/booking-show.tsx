'use client';

import { CardSkeleton } from '@/shared/components/feedback/skeletons/card-skeleton';
import { GenericShowPage } from '@/shared/components/templates/generic-show-page';
import { bookingsConfig } from '@/shared/entities/configs/bookings.config';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import { BookingActionsDialog } from './booking-actions-dialog';

const bookingHooks = createEntityHooks(bookingsConfig);

/**
 * Bookings declares no `edit` access, so there is no edit link here. Everything
 * else — labels, title, and which fields appear — comes from the config's
 * `ui.show` declaration instead of being restated in this component.
 */
export function BookingShow(_props: Readonly<{ area: DashboardArea; id: string }>) {
  const { t } = useDashboardTranslation();
  const booking = bookingHooks.useEntity(_props.id);
  if (booking.data === undefined) {
    return <CardSkeleton />;
  }
  const bookingEntity = booking.data;
  return (
    <GenericShowPage
      actions={<BookingActionsDialog bookingId={bookingEntity.id} />}
      details={bookingsConfig.ui.show.fields.map((field) => ({
        label: t(field.label),
        value: field.value(bookingEntity),
      }))}
      title={t(bookingsConfig.messages.singular)}
    />
  );
}
