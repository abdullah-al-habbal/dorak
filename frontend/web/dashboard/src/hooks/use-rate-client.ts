"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { rateClient } from "@/services/api/mutation/rate-client.mutation";
import type { ClientRatingInput } from "@/types/client-rating.type";

interface RateClientVariables {
  bookingId: string;
  input: ClientRatingInput;
}

/** Failures are rethrown to the dialog, which shows the reason inline. */
export function useRateClient(): UseMutationResult<unknown, Error, RateClientVariables> {
  const { bookings } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ bookingId, input }: RateClientVariables) => rateClient(bookingId, input),
    invalidate: [bookingKeys.all],
    successMessage: () => bookings.rateClient.success,
  });
}
