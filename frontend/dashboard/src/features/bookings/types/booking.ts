export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'canceled' | 'no_show';

export interface Booking {
  id: string;
  status: BookingStatus;
  timeSlot: string;
  clientName: string;
  stylistName: string | null;
  chairLabel: string | null;
}

export interface PaginatedBookings {
  items: Booking[];
  total: number;
}
