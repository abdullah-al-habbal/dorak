"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { bookingKeys } from "@/lib/booking-keys";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { updateBookingStatus } from "@/services/api/mutation/update-booking-status.mutation";
import type { BookingTarget } from "@/types/booking-target.type";

const HTTP_CONFLICT = 409;
const HTTP_BAD_REQUEST = 400;

export function useUpdateBookingStatus() {
  const { bookings } = useDictionary();
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, target }: { id: string; target: BookingTarget }) => updateBookingStatus(id, target),
    onSuccess: () => toast.success(bookings.toast.updated),
    onError: (error) => {
      const status = error instanceof ApiClientError ? error.status : 0;
      toast.error(
        status === HTTP_CONFLICT ? bookings.toast.conflict : status === HTTP_BAD_REQUEST ? bookings.toast.invalid : bookings.toast.failed,
      );
    },
    onSettled: () => client.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}
