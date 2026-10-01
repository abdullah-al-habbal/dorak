'use client';
import { GenericShowPage } from '@/shared/components/templates/generic-show-page';
import { CardSkeleton } from '@/shared/components/feedback/skeletons/card-skeleton';
import { useBooking } from '@/features/bookings/hooks';
import type { BookingShowPageProps } from '@/features/bookings/types/components';
export function BookingShowPage({ id }: Readonly<BookingShowPageProps>) { const query = useBooking(id); if (query.data === undefined) return <CardSkeleton />; const booking = query.data; return <GenericShowPage details={[{ label: 'Status', value: booking.status }, { label: 'Start', value: booking.time_slot }, { label: 'End', value: booking.ends_at }, { label: 'Chair', value: booking.chair?.label ?? '—' }, { label: 'Stylist', value: booking.barber?.name.en ?? '—' }, { label: 'Services', value: booking.services.map((service) => service.name.en).join(', ') }]} title="Booking" />; }
