"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { bookingStatusErrorMessage } from "@/lib/booking-status-error.util";
import { updateBookingStatus } from "@/services/api/mutation/update-booking-status.mutation";
import type { Booking } from "@/types/booking.type";
import type { BookingTarget } from "@/types/booking-target.type";

interface BookingStatusVariables {
  id: string;
  target: BookingTarget;
}

export function useUpdateBookingStatus(): UseMutationResult<Booking, Error, BookingStatusVariables> {
  const { bookings } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, target }: BookingStatusVariables) => updateBookingStatus(id, target),
    invalidate: [bookingKeys.all],
    successMessage: () => bookings.toast.updated,
    errorMessage: (error) => bookingStatusErrorMessage(error, bookings.toast),
  });
}
