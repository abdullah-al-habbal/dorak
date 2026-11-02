import { z } from "zod";

export function createWalkInBookingSchema(copy: {
  invalidAppointmentTime: string;
}) {
  return z.object({
    branchId: z.string().uuid(),
    chairId: z.string().uuid(),
    barberId: z.string().uuid().nullable(),
    customerName: z.string().min(1).max(120),
    customerEmail: z.string().email().max(255),
    customerPhone: z.string().max(30).optional(),
    serviceIds: z.array(z.string().uuid()).min(1),
    startsAt: z
      .string()
      .min(1)
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        copy.invalidAppointmentTime,
      ),
  });
}
