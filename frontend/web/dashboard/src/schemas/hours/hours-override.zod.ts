import { z } from "zod";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** `GET /branches/{id}/hours-overrides` (`BranchHoursOverrideResource`): a closure day or one day's special hours. */
export const hoursOverrideSchema = z.object({
  date: z.string(),
  is_closed: z.boolean(),
  opens_time: z.string().nullable(),
  closes_time: z.string().nullable(),
});

export const hoursOverrideListSchema = z.array(hoursOverrideSchema);

/** `PUT /branches/{id}/hours-overrides` body (FT-8): the same hours on every day of a range, optionally only on some weekdays (0 is Sunday). */
export const hoursOverrideRangeInputSchema = z.object({
  date_from: z.string(),
  date_to: z.string(),
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
  is_closed: z.boolean(),
  opens_time: z.string().regex(TIME_PATTERN).optional(),
  closes_time: z.string().regex(TIME_PATTERN).optional(),
});

/** `PUT /branches/{id}/hours-overrides/{date}` body: closed all day, or one interval. */
export const hoursOverrideInputSchema = z.union([
  z.object({ is_closed: z.literal(true) }),
  z.object({ is_closed: z.literal(false), opens_time: z.string().regex(TIME_PATTERN), closes_time: z.string().regex(TIME_PATTERN) }),
]);
