import { SCHEDULE_PER_PAGE } from "@/config/ops/schedule.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { scheduleWindow } from "@/lib/bookings/schedule-filters.util";
import { resolvePageInfo } from "@/lib/core/query/resolve-page-info.util";
import { bookingListSchema } from "@/schemas/bookings/booking.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { BookingPage } from "@/types/bookings/booking-page.type";
import type { ScheduleFilters } from "@/types/bookings/schedule-filters.type";

export async function fetchScheduleAppointments(filters: ScheduleFilters, weekStart: number): Promise<BookingPage> {
  const window = scheduleWindow(filters.range, new Date(), weekStart);
  const params = new URLSearchParams({ date_from: window.from, per_page: String(SCHEDULE_PER_PAGE), page: String(filters.page) });
  if (window.to) params.set("date_to", window.to);
  if (filters.status) params.set("booking_status", filters.status);

  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/schedule/appointments?${params.toString()}`, { schema: bookingListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, SCHEDULE_PER_PAGE, filters.page) };
}
