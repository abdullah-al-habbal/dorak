/** Values the backend stores in `bookings.status`. Never camelCase these. */
export type BookingStatus =
  'canceled' | 'completed' | 'confirmed' | 'in_progress' | 'no_show' | 'pending';
