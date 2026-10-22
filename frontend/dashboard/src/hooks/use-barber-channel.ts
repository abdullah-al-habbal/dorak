"use client";

import { realtimeEcho } from "@/services/realtime/echo-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useBarberChannel(barberId: string | null) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!barberId) return;
    const echo = realtimeEcho();
    if (!echo) return;
    const refreshAppointments = () =>
      queryClient.invalidateQueries({ queryKey: ["barber", "appointments"] });
    echo
      .private(`barber.${barberId}`)
      .listen(".booking.status.updated", refreshAppointments)
      .listen(".booking.cancelled", refreshAppointments)
      .listen(".booking.rescheduled", refreshAppointments)
      .listen(".workstation.status.toggled", () =>
        queryClient.invalidateQueries({ queryKey: ["barber", "profile"] }),
      );
    return () => echo.leave(`private-barber.${barberId}`);
  }, [barberId, queryClient]);
}
