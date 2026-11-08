"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import type { ReschedulePayload } from "@/interfaces/reschedule-payload.interface";
import { bookingKeys } from "@/lib/booking-keys";
import { rescheduleBooking } from "@/services/api/mutation/reschedule-booking.mutation";
import type { Booking } from "@/types/booking.type";

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
