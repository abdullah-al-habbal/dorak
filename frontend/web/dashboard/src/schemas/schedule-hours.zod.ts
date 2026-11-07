import { z } from "zod";

export const scheduleHoursRowSchema = z.object({
  id: z.string(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  is_active: z.boolean(),
});

export const scheduleHoursListSchema = z.array(scheduleHoursRowSchema);
