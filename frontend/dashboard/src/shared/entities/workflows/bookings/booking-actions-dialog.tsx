'use client';

import { useRef, useState } from 'react';
import { mutateEntity } from '@/shared/api';
import { isDashboardApiError } from '@/shared/api/dashboard-api-error';
import { Button } from '@/shared/components/buttons/button';
import { showError, showSuccess } from '@/shared/components/feedback/toast';
import { bookingsConfig } from '@/shared/entities/configs/bookings.config';
import type { BookingStatus } from '@/shared/entities/domain';
import { mapBookingFromWire, type BookingWire } from '@/shared/entities/domain/booking-wire';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import { useInvalidatingMutation } from '@/shared/hooks/use-invalidating-mutation';

type NextStatus = Exclude<BookingStatus, 'pending' | 'completed' | 'canceled' | 'no_show'>;

const bookingHooks = createEntityHooks(bookingsConfig);
const invalidations = [
  bookingHooks.queryKeys.all,
  ['dashboard', 'chairs'],
  ['dashboard', 'overview'],
] as const;

export function BookingActionsDialog({ bookingId }: Readonly<{ bookingId: string }>) {
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
  const updateStatus = useInvalidatingMutation(
    {
      mutationFn: async (status: NextStatus) =>
        mapBookingFromWire(
          await mutateEntity<{ status: NextStatus }, BookingWire>(
            `/dashboard/bookings/${bookingId}`,
            'PATCH',
            { status },
          ),
        ),
    },
    invalidations,
  );
  const reschedule = useInvalidatingMutation(
    {
      mutationFn: async (input: { readonly endsAt: string; readonly timeSlot: string }) =>
        mapBookingFromWire(
          await mutateEntity<{ ends_at: string; time_slot: string }, BookingWire>(
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
        Manage
      </Button>
      <dialog
        className="max-w-md rounded-lg border bg-surface p-6 text-foreground"
        ref={dialog}
        onClose={close}
      >
        <h2 className="text-lg font-semibold">Manage booking</h2>
        <div className="mt-4 grid gap-3">
          <select
            disabled={updateStatus.isPending || nextStatuses(status).length === 0}
            onChange={(event) => {
              const next = event.target.value as NextStatus | '';
              if (next !== '') {
                updateStatus.mutate(next, { onSuccess: close });
              }
            }}
            value=""
          >
            <option value="">Select next status</option>
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
            Close
          </Button>
          <Button
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(undefined, {
                onSuccess: () => {
                  showSuccess('Booking canceled.');
                  close();
                },
              })
            }
            type="button"
            variant="outline"
          >
            Cancel booking
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
                        ? 'This chair is already booked for that time. Choose another time window.'
                        : error.message;
                    setConflict(message);
                    showError(message);
                  },
                  onSuccess: () => {
                    showSuccess('Booking rescheduled.');
                    close();
                  },
                },
              )
            }
            type="button"
          >
            Reschedule
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
