"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

type BarberMutationResource =
  | "appointments"
  | "profile"
  | "schedule"
  | "portfolio";

export function useBarberMutation<TData, TVariables>(
  resource: BarberMutationResource,
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["barber", resource] });
    },
  });
}
