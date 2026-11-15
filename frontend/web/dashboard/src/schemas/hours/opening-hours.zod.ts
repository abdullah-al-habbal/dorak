import { z } from "zod";

import { Weekday } from "@/enums/booking/weekday.enum";

const TIME_LENGTH = 5;
const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}/)
  .transform((value) => value.slice(0, TIME_LENGTH));

export const shiftSchema = z.object({ opens_time: timeSchema, closes_time: timeSchema });

export const openingHoursDaySchema = z.object({
  day_of_week: z.enum(Weekday),
  is_closed: z.boolean(),
  shifts: z.array(shiftSchema).default([]),
});

export const openingHoursSchema = z.object({ opening_hours: z.array(openingHoursDaySchema) });
