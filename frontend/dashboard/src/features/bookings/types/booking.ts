export type BookingStatus =
  'pending' | 'confirmed' | 'in_progress' | 'completed' | 'canceled' | 'no_show';

export interface Booking {
  id: string;
  status: BookingStatus;
  time_slot: string;
  ends_at: string;
  chair: { label: string } | null;
  barber: { name: { en: string } } | null;
  services: { name: { en: string } }[];
}
export interface WalkInBookingInput {
  barber_id?: string | undefined;
  branch_id: string;
  chair_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string | undefined;
  service_ids: string[];
  time_slot: string;
}
export interface PaginatedBookings {
  items: Booking[];
  total: number;
}
