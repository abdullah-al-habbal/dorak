"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { scheduleKeys } from "@/lib/schedule-keys";
import { fetchScheduleHours } from "@/services/api/query/schedule-hours.query";
import type { ScheduleHoursRow } from "@/types/schedule-hours-row.type";

export function useScheduleHours(): UseQueryResult<ScheduleHoursRow[]> {
  return useQuery({ queryKey: scheduleKeys.hours, queryFn: fetchScheduleHours });
}
