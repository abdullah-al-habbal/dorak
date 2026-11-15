import { z } from "zod";

export const bookingHistoryEntrySchema = z.object({
  id: z.string(),
  from_status: z.string().nullable().optional(),
  to_status: z.string(),
  actor_type: z.string(),
  reason: z.string().nullable().optional(),
  created_at: z.string(),
});

export const bookingHistorySchema = z.array(bookingHistoryEntrySchema);
