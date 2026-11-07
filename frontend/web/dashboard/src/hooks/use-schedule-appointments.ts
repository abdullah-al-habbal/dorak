"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { scheduleKeys } from "@/lib/schedule-keys";
import { fetchScheduleAppointments } from "@/services/api/query/schedule-appointments.query";
import type { BookingPage } from "@/types/booking-page.type";
import type { ScheduleFilters } from "@/types/schedule-filters.type";

export function useScheduleAppointments(filters: ScheduleFilters, weekStart: number): UseQueryResult<BookingPage> {
  return useQuery({
    queryKey: scheduleKeys.appointments(filters.range, filters.status ?? "", filters.page),
    queryFn: () => fetchScheduleAppointments(filters, weekStart),
    placeholderData: keepPreviousData,
  });
}
