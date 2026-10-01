export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'canceled' | 'no_show';

export interface Booking { id: string; status: BookingStatus; time_slot: string; ends_at: string; chair: { label: string } | null; barber: { name: { en: string } } | null; services: { name: { en: string } }[]; }
export interface PaginatedBookings { items: Booking[]; total: number; }
