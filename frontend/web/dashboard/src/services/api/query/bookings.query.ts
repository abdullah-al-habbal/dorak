import { DASHBOARD_API } from "@/config/routes.constant";
import { windowFor } from "@/lib/booking-filters.util";
import { bookingListSchema } from "@/schemas/booking.zod";
import { pageInfoSchema } from "@/schemas/page-info.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { Booking } from "@/types/booking.type";
import type { BookingFilters } from "@/types/booking-filters.type";
import type { BookingPage } from "@/types/booking-page.type";

const PER_PAGE = 100;
const MAX_PAGES = 10;

function queryString(filters: BookingFilters, weekStart: number, page: number): string {
  const { from, to } = windowFor(filters, weekStart);
  const params = new URLSearchParams({ date_from: from, date_to: to, per_page: String(PER_PAGE), page: String(page) });
  if (filters.status) params.set("booking_status", filters.status);
  if (filters.chairId) params.set("chair_id", filters.chairId);
  if (filters.search) params.set("search", filters.search);
  return params.toString();
}

export async function fetchBookingPage(filters: BookingFilters, weekStart: number, page: number): Promise<BookingPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/bookings?${queryString(filters, weekStart, page)}`, {
    schema: bookingListSchema,
  });
  const pagination = pageInfoSchema.safeParse((meta as { pagination?: unknown } | null)?.pagination);
  const fallback = { total: data.length, per_page: PER_PAGE, current_page: page, total_pages: 1 };
  return { items: data, page: pagination.success ? pagination.data : fallback };
}

/** Follows the pagination metadata until the window is complete, for the grids. */
export async function fetchBookingWindow(filters: BookingFilters, weekStart: number): Promise<Booking[]> {
  const first = await fetchBookingPage(filters, weekStart, 1);
  const items = [...first.items];
  for (let page = 2; page <= Math.min(first.page.total_pages, MAX_PAGES); page += 1) {
    items.push(...(await fetchBookingPage(filters, weekStart, page)).items);
  }
  return items;
}
