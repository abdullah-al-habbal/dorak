import { DASHBOARD_API } from "@/config/routes.constant";
import { scheduleHoursListSchema } from "@/schemas/bookings/schedule-hours.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ScheduleHoursRow } from "@/types/bookings/schedule-hours-row.type";

export function fetchScheduleHours(): Promise<ScheduleHoursRow[]> {
  return apiRequest(`${DASHBOARD_API}/schedule/hours`, { schema: scheduleHoursListSchema });
}
