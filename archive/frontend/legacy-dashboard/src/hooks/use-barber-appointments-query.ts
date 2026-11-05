"use client";

import { getBarberTodayAppointments } from "@/services/api/barber-workspace/barber-workspace.query";
import { useQuery } from "@tanstack/react-query";

export function useBarberAppointmentsQuery() {
  return useQuery({
    queryKey: ["barber", "appointments", "today"],
    queryFn: getBarberTodayAppointments,
  });
}
