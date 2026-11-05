"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import type { WalkInPayload } from "@/interfaces/walk-in-payload.interface";
import { bookingKeys } from "@/lib/booking-keys";
import { createWalkIn } from "@/services/api/mutation/create-walk-in.mutation";
import type { Booking } from "@/types/booking.type";

export function useCreateWalkIn(): UseMutationResult<Booking, Error, WalkInPayload> {
  const { bookings } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: createWalkIn,
    onSuccess: () => toast.success(bookings.walkIn.success),
    onSettled: () => client.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}
