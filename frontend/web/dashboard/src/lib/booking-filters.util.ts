import { BookingStatus } from "@/enums/booking-status.enum";
import { BookingView } from "@/enums/booking-view.enum";
import { addDays, parseDateKey, startOfWeek, toDateKey } from "@/lib/booking-date.util";
import type { BookingFilters } from "@/types/bookings/booking-filters.type";

const STATUSES = new Set<string>(Object.values(BookingStatus));
const VIEWS = new Set<string>(Object.values(BookingView));
const MAX_SEARCH = 100;

export function defaultFilters(today: Date): BookingFilters {
  return { view: BookingView.Week, date: toDateKey(today), page: 1 };
}

export function filtersFromParams(params: URLSearchParams, today: Date): BookingFilters {
  const base = defaultFilters(today);
  const view = params.get("view");
  const date = params.get("date");
  const status = params.get("status");
  const page = Number(params.get("page"));
  return {
    view: view && VIEWS.has(view) ? (view as BookingView) : base.view,
    date: date && parseDateKey(date) ? date : base.date,
    status: status && STATUSES.has(status) ? (status as BookingStatus) : undefined,
    chairId: params.get("chair") || undefined,
    search: params.get("search")?.slice(0, MAX_SEARCH) || undefined,
    hideCancelled: params.get("hide_cancelled") === "1" ? true : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function filtersToParams(filters: BookingFilters, today: Date): URLSearchParams {
  const base = defaultFilters(today);
  const params = new URLSearchParams();
  if (filters.view !== base.view) params.set("view", filters.view);
  if (filters.date !== base.date) params.set("date", filters.date);
  if (filters.status) params.set("status", filters.status);
  if (filters.chairId) params.set("chair", filters.chairId);
  if (filters.search) params.set("search", filters.search);
  if (filters.hideCancelled) params.set("hide_cancelled", "1");
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** The inclusive date window a view needs. Day shows one day; Week and List show the week. */
export function windowFor(filters: BookingFilters, weekStart: number): { from: string; to: string } {
  const day = parseDateKey(filters.date) ?? new Date();
  if (filters.view === BookingView.Day) return { from: toDateKey(day), to: toDateKey(day) };
  const start = startOfWeek(day, weekStart);
  return { from: toDateKey(start), to: toDateKey(addDays(start, 6)) };
}
