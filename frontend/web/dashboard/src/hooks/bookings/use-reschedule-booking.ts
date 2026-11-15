"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import type { ReschedulePayload } from "@/interfaces/bookings/reschedule-payload.interface";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { rescheduleBooking } from "@/services/api/mutation/reschedule-booking.mutation";
import type { Booking } from "@/types/bookings/booking.type";

interface RescheduleVariables {
  id: string;
  payload: ReschedulePayload;
}

export function useRescheduleBooking(): UseMutationResult<Booking, Error, RescheduleVariables> {
  const { bookings } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, payload }: RescheduleVariables) => rescheduleBooking(id, payload),
    invalidate: [bookingKeys.all],
    successMessage: () => bookings.reschedule.success,
  });
}
