"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import type { WalkInPayload } from "@/interfaces/bookings/walk-in-payload.interface";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { createWalkIn } from "@/services/api/mutation/create-walk-in.mutation";
import type { Booking } from "@/types/bookings/booking.type";

export function useCreateWalkIn(): UseMutationResult<Booking, Error, WalkInPayload> {
  const { bookings } = useDictionary();
  return useFeedbackMutation({
    mutationFn: createWalkIn,
    invalidate: [bookingKeys.all],
    successMessage: () => bookings.walkIn.success,
  });
}
