import type { BookingStatus } from './booking-status';

export type NextStatus = Exclude<BookingStatus, 'pending' | 'completed' | 'canceled' | 'no_show'>;
