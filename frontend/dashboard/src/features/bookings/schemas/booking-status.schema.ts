import { z } from 'zod';

export const bookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'in_progress', 'completed', 'canceled', 'no_show']),
});

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;
