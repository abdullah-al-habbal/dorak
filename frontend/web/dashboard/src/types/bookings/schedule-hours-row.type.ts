import type { z } from "zod";

import type { scheduleHoursRowSchema } from "@/schemas/bookings/schedule-hours.zod";

export type ScheduleHoursRow = z.infer<typeof scheduleHoursRowSchema>;
