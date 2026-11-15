"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import type { WalkInPayload } from "@/interfaces/walk-in-payload.interface";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { createWalkIn } from "@/services/api/mutation/create-walk-in.mutation";
import type { Booking } from "@/types/booking.type";

export function useCreateWalkIn(): UseMutationResult<Booking, Error, WalkInPayload> {
  const { bookings } = useDictionary();
  return useFeedbackMutation({
    mutationFn: createWalkIn,
    invalidate: [bookingKeys.all],
    successMessage: () => bookings.walkIn.success,
  });
}
