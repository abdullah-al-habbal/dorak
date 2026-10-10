"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDashboardMutation<TData, TVariables>(resource: string, mutationFn: (variables: TVariables) => Promise<TData>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", resource] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "chairs"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] }),
      ]);
    },
  });
}
