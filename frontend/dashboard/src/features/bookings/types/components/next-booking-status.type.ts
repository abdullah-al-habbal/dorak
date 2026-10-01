import type { BookingStatus } from '@/features/bookings/types/booking';

export type NextBookingStatus = Exclude<BookingStatus, 'pending'>;
