"use client";

import { realtimeEcho } from "@/services/realtime/echo-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { BRANCH_CHANNEL_BOOKING_EVENTS } from "@/config/branch-channel.constant";

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
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };
    for (const event of BRANCH_CHANNEL_BOOKING_EVENTS)
      channel.listen(event, refresh);
    return () => echo.leave(`private-branch.${branchId}`);
  }, [branchId, queryClient]);
}
