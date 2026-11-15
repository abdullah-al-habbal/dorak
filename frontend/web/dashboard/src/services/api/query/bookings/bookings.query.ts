import { DASHBOARD_API } from "@/config/routes.constant";
import { BookingView } from "@/enums/booking-view.enum";
import { windowFor } from "@/lib/bookings/booking-filters.util";
import { resolvePageInfo } from "@/lib/core/resolve-page-info.util";
import { bookingListSchema } from "@/schemas/bookings/booking.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { Booking } from "@/types/bookings/booking.type";
import type { BookingFilters } from "@/types/bookings/booking-filters.type";
import type { BookingPage } from "@/types/bookings/booking-page.type";

const PER_PAGE = 100;
const MAX_PAGES = 10;
const FIRST_PAGE = 1;

function queryString(filters: BookingFilters, weekStart: number, page: number): string {
  const { from, to } = windowFor(filters, weekStart);
  const params = new URLSearchParams({ date_from: from, date_to: to, per_page: String(PER_PAGE), page: String(page) });
  if (filters.status) params.set("booking_status", filters.status);
  if (filters.chairId) params.set("chair_id", filters.chairId);
  if (filters.hideCancelled) params.set("hide_cancelled", "1");
  if (filters.search) params.set("search", filters.search);
  return params.toString();
}

export async function fetchBookingPage(filters: BookingFilters, weekStart: number, page: number): Promise<BookingPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/bookings?${queryString(filters, weekStart, page)}`, {
    schema: bookingListSchema,
  });
  return { items: data, page: resolvePageInfo(meta, data.length, PER_PAGE, page) };
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

/** The list view reads one page; the day and week grids read the whole window as a single page. */
export async function fetchBookingsForView(filters: BookingFilters, weekStart: number): Promise<BookingPage> {
  if (filters.view === BookingView.List) return fetchBookingPage(filters, weekStart, filters.page);
  const items = await fetchBookingWindow(filters, weekStart);
  return { items, page: resolvePageInfo(null, items.length, items.length, FIRST_PAGE) };
}
