"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { HttpStatus } from "@/enums/http-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { bookingKeys } from "@/lib/booking-keys";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { updateBookingStatus } from "@/services/api/mutation/update-booking-status.mutation";
import type { BookingTarget } from "@/types/booking-target.type";


export function useUpdateBookingStatus() {
  const { bookings } = useDictionary();
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, target }: { id: string; target: BookingTarget }) => updateBookingStatus(id, target),
    onSuccess: () => toast.success(bookings.toast.updated),
    onError: (error) => {
      const status = error instanceof ApiClientError ? error.status : 0;
      toast.error(
        status === HttpStatus.Conflict ? bookings.toast.conflict : status === HttpStatus.BadRequest ? bookings.toast.invalid : bookings.toast.failed,
      );
    },
    onSettled: () => client.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}
