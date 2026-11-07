import { SCHEDULE_PER_PAGE } from "@/config/schedule.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { scheduleWindow } from "@/lib/schedule-filters.util";
import { bookingListSchema } from "@/schemas/booking.zod";
import { pageInfoSchema } from "@/schemas/page-info.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { BookingPage } from "@/types/booking-page.type";
import type { ScheduleFilters } from "@/types/schedule-filters.type";

export async function fetchScheduleAppointments(filters: ScheduleFilters, weekStart: number): Promise<BookingPage> {
  const window = scheduleWindow(filters.range, new Date(), weekStart);
  const params = new URLSearchParams({ date_from: window.from, per_page: String(SCHEDULE_PER_PAGE), page: String(filters.page) });
  if (window.to) params.set("date_to", window.to);
  if (filters.status) params.set("booking_status", filters.status);

  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/schedule/appointments?${params.toString()}`, { schema: bookingListSchema });
  const pagination = pageInfoSchema.safeParse((meta as { pagination?: unknown } | null)?.pagination);
  const fallback = { total: data.length, per_page: SCHEDULE_PER_PAGE, current_page: filters.page, total_pages: 1 };
  return { items: data, page: pagination.success ? pagination.data : fallback };
}
