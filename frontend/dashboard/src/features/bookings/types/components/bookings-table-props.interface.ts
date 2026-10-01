import type { Booking } from '@/features/bookings/types/booking';

export interface BookingsTableProps { bookings: Booking[]; onSelect: (booking: Booking) => void; }
