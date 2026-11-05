"use client";

import { DASHBOARD_RESOURCES } from "@/services/api/dashboard/shared/dashboard-resource.constant";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Entity resources are cross-linked (chairs reference a branch, services
 * reference a branch/brand/barber, stylists reference a chair, bookings
 * reference all of the above), so any dashboard mutation invalidates every
 * entity resource's cache, not just the one it targets, to avoid leaving
 * stale/orphaned records visible after a parent-child change elsewhere.
 */
export function useDashboardMutation<TData, TVariables>(
  resource: string,
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", resource] }),
        ...DASHBOARD_RESOURCES.map((dashboardResource) =>
          queryClient.invalidateQueries({
            queryKey: ["dashboard", dashboardResource],
          }),
        ),
      ]);
    },
  });
}
