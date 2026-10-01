'use client';
import { GenericShowPage } from '@/shared/components/templates/generic-show-page';
import { useBooking } from '@/features/bookings/hooks/use-bookings';
export function BookingShowPage({ id }: Readonly<{ id: string }>) { const query = useBooking(id); if (query.data === undefined) return <p>Loading booking…</p>; const booking = query.data; return <GenericShowPage details={[{ label: 'Status', value: booking.status }, { label: 'Start', value: booking.time_slot }, { label: 'End', value: booking.ends_at }, { label: 'Chair', value: booking.chair?.label ?? '—' }, { label: 'Stylist', value: booking.barber?.name.en ?? '—' }, { label: 'Services', value: booking.services.map((service) => service.name.en).join(', ') }]} title="Booking" />; }
