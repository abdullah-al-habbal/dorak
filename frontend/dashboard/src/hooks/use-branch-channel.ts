"use client";

import { realtimeEcho } from "@/services/realtime/echo-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useBranchChannel(branchId: string | null) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!branchId) return;
    const echo = realtimeEcho();
    if (!echo) return;
    echo
      .private(`branch.${branchId}`)
      .listen(".booking.created", () =>
        queryClient.invalidateQueries({ queryKey: ["dashboard", "bookings"] }),
      )
      .listen(".booking.status.updated", () =>
        queryClient.invalidateQueries({ queryKey: ["dashboard", "bookings"] }),
      )
      .listen(".booking.cancelled", () =>
        queryClient.invalidateQueries({ queryKey: ["dashboard", "bookings"] }),
      );
    return () => echo.leave(`private-branch.${branchId}`);
  }, [branchId, queryClient]);
}
