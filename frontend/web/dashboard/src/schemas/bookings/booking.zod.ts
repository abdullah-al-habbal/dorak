import { z } from "zod";

import { BookingStatus } from "@/enums/booking/booking-status.enum";
import { clientRatingSchema } from "@/schemas/clients/client-rating.zod";

const localized = z.union([z.string(), z.record(z.string(), z.string().nullable())]);

const chairSchema = z.object({ id: z.string(), label: z.string().nullable().optional() }).nullable().optional();
const barberSchema = z.object({ id: z.string(), name: z.string().nullable().optional() }).nullable().optional();
const serviceSchema = z.object({
  id: z.string(),
  name: localized.nullable().optional(),
  price_amount_minor: z.number().nullable().optional(),
  currency_code: z.string().nullable().optional(),
  duration_minutes: z.number().nullable().optional(),
});
const clientSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

export const bookingSchema = z.object({
  id: z.string(),
  starts_at: z.string(),
  ends_at: z.string().nullable().optional(),
  booking_status: z.enum(BookingStatus),
  payment_status: z.string().nullable().optional(),
  chair: chairSchema,
  barber: barberSchema,
  services: z.array(serviceSchema).optional().default([]),
  client: clientSchema,
  client_review: clientRatingSchema.nullable().optional(),
});

export const bookingListSchema = z.array(bookingSchema);
