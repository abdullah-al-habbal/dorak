"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
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
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: RescheduleVariables) => rescheduleBooking(id, payload),
    onSuccess: () => toast.success(bookings.reschedule.success),
    onSettled: () => client.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}
