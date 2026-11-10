import { z } from "zod";

import { ClientStatus } from "@/enums/client-status.enum";
import { localizedTextSchema } from "@/schemas/localized-text.zod";

/** One ban (`AdminBanResource`). */
export const clientBanSchema = z.object({
  id: z.string(),
  reason: z.string().nullable().optional(),
  banned_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  lifted_at: z.string().nullable().optional(),
  banned_by: z.string().nullable().optional(),
  active: z.boolean(),
});

/** `GET /admin/clients` (`AdminClientResource`): the account, bans and bookings count only (D4). */
export const adminClientSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email_verified_at: z.string().nullable().optional(),
  phone_verified_at: z.string().nullable().optional(),
  status: z.enum(ClientStatus),
  is_banned: z.boolean(),
  bookings_count: z.number().optional(),
  bans: z.array(clientBanSchema).optional(),
  created_at: z.string().nullable().optional(),
});

export const adminClientListSchema = z.array(adminClientSchema);

/** A booking row in the client's history (`BookingResource`); only the fields the admin reads. */
export const clientBookingSchema = z.object({
  id: z.string(),
  starts_at: z.string(),
  booking_status: z.string(),
  payment_status: z.string().nullable().optional(),
});

export const clientBookingListSchema = z.array(clientBookingSchema);

/** A review the client wrote (`AdminReviewResource`). */
export const clientReviewSchema = z.object({
  id: z.string(),
  rating: z.number(),
  body: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  subject_name: z.string().nullable().optional(),
  created_at: z.string(),
});

export const clientReviewListSchema = z.array(clientReviewSchema);
