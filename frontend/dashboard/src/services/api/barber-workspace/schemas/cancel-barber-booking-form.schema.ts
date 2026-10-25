import { z } from "zod";

export const cancelBarberBookingFormSchema = z.object({
  cancellationReason: z.string().min(1),
});
