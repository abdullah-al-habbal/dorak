import { z } from "zod";

export const walkInBookingSchema = z.object({
  branchId: z.string().uuid(),
  chairId: z.string().uuid(),
  barberId: z.string().uuid().nullable(),
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email().max(255),
  customerPhone: z.string().max(30).optional(),
  serviceIds: z.array(z.string().uuid()).min(1),
  timeSlot: z.string().min(1).refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid appointment time."),
});
