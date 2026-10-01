import type { BookingStatusInput } from '@/features/bookings/schemas/booking-status.schema';
import type { Booking, BookingStatus } from '@/features/bookings/types/booking';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';

export interface BookingActionsDialogProps { bookingId: string; status?: BookingStatus; }
export interface BookingListProps { area: DashboardArea; }
export interface BookingShowPageProps { id: string; }
export interface BookingStatusDialogProps { booking: Booking; isPending: boolean; onSubmit: (input: BookingStatusInput) => void; }
export interface BookingsTableProps { bookings: Booking[]; onSelect: (booking: Booking) => void; }
export interface WalkInBookingCreatePageProps { area: DashboardArea; }
export type NextBookingStatus = Exclude<BookingStatus, 'pending'>;
