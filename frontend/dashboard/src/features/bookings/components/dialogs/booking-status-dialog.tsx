'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { bookingStatusSchema, type BookingStatusInput } from '@/features/bookings/schemas/booking-status.schema';
import type { Booking } from '@/features/bookings/types/booking';

interface BookingStatusDialogProps {
  booking: Booking;
  isPending: boolean;
  onSubmit: (input: BookingStatusInput) => void;
}

export function BookingStatusDialog({ booking, isPending, onSubmit }: Readonly<BookingStatusDialogProps>) {
  const form = useForm<BookingStatusInput>({ defaultValues: { status: booking.status === 'pending' ? 'confirmed' : booking.status }, resolver: zodResolver(bookingStatusSchema) });
  return <form onSubmit={form.handleSubmit(onSubmit)}><label htmlFor="booking-status">Status</label><select id="booking-status" {...form.register('status')}><option value="confirmed">Confirmed</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="canceled">Canceled</option><option value="no_show">No-show</option></select><button className="bg-primary p-2 text-background" disabled={isPending} type="submit">Update booking</button></form>;
}
