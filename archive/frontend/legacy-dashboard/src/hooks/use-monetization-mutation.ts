"use client";

import { useDictionary } from "@/hooks/use-dictionary";
import {
  notifyApiError,
  notifySuccess,
} from "@/services/api/core/notifications";
import { MONETIZATION_QUERY_KEYS } from "@/services/api/dashboard/monetization/monetization.constant";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface IMonetizationMutationOptions<TData> {
  successMessage: string;
  onSuccess?: (data: TData) => void;
}

/**
 * Admin monetization screens are cross-linked (a subscription change moves
 * analytics, a payout moves commission entries), so every mutation refreshes
 * all monetization lists and reports success or failure the same way.
 */
export function useMonetizationMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  { successMessage, onSuccess }: IMonetizationMutationOptions<TData>,
) {
  const dictionary = useDictionary();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (data) => {
      notifySuccess(successMessage);
      await Promise.all(
        Object.values(MONETIZATION_QUERY_KEYS).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      onSuccess?.(data);
    },
    onError: (error) => notifyApiError(error, dictionary),
  });
}
