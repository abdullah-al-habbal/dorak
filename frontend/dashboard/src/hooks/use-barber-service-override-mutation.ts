"use client";

import { useDictionary } from "@/hooks/use-dictionary";
import {
  notifyApiError,
  notifySuccess,
} from "@/services/api/core/notifications";
import { BARBER_SERVICE_TERMS_QUERY_KEY } from "@/services/api/dashboard/barber-service-override/barber-service-override.constant";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** Saves or clears a brand's terms for a barber service, then refreshes the terms list. */
export function useBarberServiceOverrideMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  successMessage: string,
) {
  const dictionary = useDictionary();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      notifySuccess(successMessage);
      await queryClient.invalidateQueries({
        queryKey: BARBER_SERVICE_TERMS_QUERY_KEY,
      });
    },
    onError: (error) => notifyApiError(error, dictionary),
  });
}
