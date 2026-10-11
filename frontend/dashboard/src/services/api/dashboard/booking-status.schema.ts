import { z } from "zod";

export const bookingStatusSchema = z.object({
  status: z.enum(["confirmed", "in_progress"]),
});
