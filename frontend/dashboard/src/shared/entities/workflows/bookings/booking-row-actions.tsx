'use client';

import type { Booking } from '@/shared/entities/domain';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import { BookingActionsDialog } from './booking-actions-dialog';

/**
 * Declared as a row action so the engine keeps owning the row: the entity table
 * renders it beside the View link instead of each list rebuilding the table.
 */
export function BookingRowActions({ entity }: Readonly<{ area: DashboardArea; entity: Booking }>) {
  return <BookingActionsDialog bookingId={entity.id} />;
}
