'use client';

import { useRef, useState } from 'react';
import { mutateEntity } from '@/shared/api';
import { isDashboardApiError } from '@/shared/api/dashboard-api-error';
import { Button } from '@/shared/components/buttons/button';
import { showError, showSuccess } from '@/shared/components/feedback/toast';
import { bookingsConfig } from '@/shared/entities/configs/bookings.config';
import type { BookingStatus, NextStatus } from '@/shared/entities/domain';
import { mapBookingFromWire, type BookingWire } from '@/shared/entities/domain/booking-wire';
import type { BookingReschedulePayloadWire } from '@/shared/entities/domain/wire/booking-reschedule-payload-wire';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import { useInvalidatingMutation } from '@/shared/hooks/use-invalidating-mutation';

const bookingHooks = createEntityHooks(bookingsConfig);
const invalidations = [
  bookingHooks.queryKeys.all,
  ['dashboard', 'chairs'],
  ['dashboard', 'overview'],
] as const;

export function BookingActionsDialog({ bookingId }: Readonly<{ bookingId: string }>) {
  const { t } = useDashboardTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [conflict, setConflict] = useState('');
  const booking = bookingHooks.useEntity(bookingId);
  const cancel = useInvalidatingMutation(
    {
      mutationFn: async () =>
        mapBookingFromWire(
          await mutateEntity<never, BookingWire>(
            `/dashboard/bookings/${bookingId}/cancel`,
            'PATCH',
          ),
        ),
    },
    invalidations,
  );
  /**
   * A status transition is the engine's own update path — same collection URL,
   * same PATCH verb, same `fromApi` mapper — so it reuses `useUpdateEntity`
   * rather than re-declaring the endpoint.
   */
  const updateStatus = bookingHooks.useUpdateEntity();
  const reschedule = useInvalidatingMutation(
    {
      mutationFn: async (input: { readonly endsAt: string; readonly timeSlot: string }) =>
        mapBookingFromWire(
          await mutateEntity<BookingReschedulePayloadWire, BookingWire>(
            `/dashboard/bookings/${bookingId}/reschedule`,
            'PATCH',
            {
              ends_at: new Date(input.endsAt).toISOString(),
              time_slot: new Date(input.timeSlot).toISOString(),
            },
          ),
        ),
    },
    invalidations,
  );
  const status = booking.data?.status ?? 'pending';
  const close = () => {
    dialog.current?.close();
    setConflict('');
  };
  return (
    <>
      <Button onClick={() => dialog.current?.showModal()} type="button" variant="outline">
        {t('actions.manage')}
      </Button>
      <dialog
        className="max-w-md rounded-lg border bg-surface p-6 text-foreground"
        ref={dialog}
        onClose={close}
      >
        <h2 className="text-lg font-semibold">{t('bookings.manage')}</h2>
        <div className="mt-4 grid gap-3">
          <select
            disabled={updateStatus.isPending || nextStatuses(status).length === 0}
            onChange={(event) => {
              const next = event.target.value as Exclude<BookingStatus, 'pending'> | '';
              if (next !== '') {
                updateStatus.mutate(
                  { id: bookingId, input: { status: next } },
                  { onSuccess: close },
                );
              }
            }}
            value=""
          >
            <option value="">{t('bookings.selectNextStatus')}</option>
            {nextStatuses(status).map((next) => (
              <option key={next} value={next}>
                {next}
              </option>
            ))}
          </select>
          <input
            onChange={(event) => setTimeSlot(event.target.value)}
            type="datetime-local"
            value={timeSlot}
          />
          <input
            onChange={(event) => setEndsAt(event.target.value)}
            type="datetime-local"
            value={endsAt}
          />
        </div>
        {conflict === '' ? null : (
          <p className="mt-3 text-sm" role="alert">
            {conflict}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button onClick={close} type="button" variant="outline">
            {t('actions.close')}
          </Button>
          <Button
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(undefined, {
                onSuccess: () => {
                  showSuccess(t('bookings.cancelled'));
                  close();
                },
              })
            }
            type="button"
            variant="outline"
          >
            {t('bookings.cancelBooking')}
          </Button>
          <Button
            disabled={reschedule.isPending || timeSlot === '' || endsAt === ''}
            onClick={() =>
              reschedule.mutate(
                { endsAt, timeSlot },
                {
                  onError: (error) => {
                    const message =
                      isDashboardApiError(error) && error.status === 409
                        ? t('bookings.conflict')
                        : error.message;
                    setConflict(message);
                    showError(message);
                  },
                  onSuccess: () => {
                    showSuccess(t('bookings.rescheduled'));
                    close();
                  },
                },
              )
            }
            type="button"
          >
            {t('bookings.reschedule')}
          </Button>
        </div>
      </dialog>
    </>
  );
}

function nextStatuses(status: BookingStatus): readonly NextStatus[] {
  return (
    {
      pending: ['confirmed'],
      confirmed: ['in_progress'],
      in_progress: [],
      completed: [],
      canceled: [],
      no_show: [],
    } as const
  )[status];
}
