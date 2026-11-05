"use client";

import { getBarberSchedule } from "@/services/api/barber-workspace/barber-workspace.query";
import { useQuery } from "@tanstack/react-query";

export function useBarberScheduleQuery() {
  return useQuery({
    queryKey: ["barber", "schedule"],
    queryFn: getBarberSchedule,
  });
}
