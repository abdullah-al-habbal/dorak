"use client";

import { realtimeEcho } from "@/services/realtime/echo-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const BOOKING_EVENTS = [
  ".booking.created",
  ".booking.status.updated",
  ".booking.cancelled",
  ".booking.rescheduled",
];

export function useBranchChannel(branchId: string | null) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!branchId) return;
    const echo = realtimeEcho();
    if (!echo) return;
    const channel = echo.private(`branch.${branchId}`);
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    };
    for (const event of BOOKING_EVENTS) channel.listen(event, refresh);
    return () => echo.leave(`private-branch.${branchId}`);
  }, [branchId, queryClient]);
}
