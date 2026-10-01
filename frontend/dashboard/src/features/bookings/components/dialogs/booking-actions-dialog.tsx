'use client';

import { useRef, useState } from 'react';
import { Button } from '@/shared/components/buttons/button';
import { showSuccess } from '@/shared/components/feedback/toast';
import { useCancelBooking, useRescheduleBooking } from '@/features/bookings/hooks/use-bookings';

export function BookingActionsDialog({ bookingId }: Readonly<{ bookingId: string }>) {
  const dialog = useRef<HTMLDialogElement>(null); const [timeSlot, setTimeSlot] = useState(''); const [endsAt, setEndsAt] = useState(''); const cancel = useCancelBooking(); const reschedule = useRescheduleBooking();
  const close = () => dialog.current?.close();
  return <><Button onClick={() => dialog.current?.showModal()} type="button" variant="outline">Actions</Button><dialog aria-labelledby={`booking-actions-${bookingId}`} className="max-w-md rounded-lg border bg-surface p-6 text-foreground backdrop:bg-foreground/20" ref={dialog}><h2 className="text-lg font-semibold" id={`booking-actions-${bookingId}`}>Manage booking</h2><div className="mt-4 grid gap-3"><label>New start<input className="w-full rounded-lg border bg-surface p-2" onChange={(event) => setTimeSlot(event.target.value)} type="datetime-local" value={timeSlot} /></label><label>New end<input className="w-full rounded-lg border bg-surface p-2" onChange={(event) => setEndsAt(event.target.value)} type="datetime-local" value={endsAt} /></label></div><div className="mt-6 flex flex-wrap justify-end gap-2"><Button onClick={close} type="button" variant="outline">Close</Button><Button disabled={cancel.isPending} onClick={() => cancel.mutate(bookingId, { onSuccess: () => { showSuccess('Booking cancelled.'); close(); } })} type="button" variant="outline">Cancel booking</Button><Button disabled={reschedule.isPending || timeSlot === '' || endsAt === ''} onClick={() => reschedule.mutate({ id: bookingId, input: { ends_at: new Date(endsAt).toISOString(), time_slot: new Date(timeSlot).toISOString() } }, { onSuccess: () => { showSuccess('Booking rescheduled.'); close(); } })} type="button">Reschedule</Button></div></dialog></>;
}
