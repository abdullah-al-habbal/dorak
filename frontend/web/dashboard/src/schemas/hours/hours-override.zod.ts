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

/** `PUT /branches/{id}/hours-overrides/{date}` body: closed all day, or one interval. */
export const hoursOverrideInputSchema = z.union([
  z.object({ is_closed: z.literal(true) }),
  z.object({ is_closed: z.literal(false), opens_time: z.string().regex(TIME_PATTERN), closes_time: z.string().regex(TIME_PATTERN) }),
]);
