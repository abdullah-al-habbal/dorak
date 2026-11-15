"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/core/use-delete-mutation";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { chairKeys } from "@/lib/query-keys/chairs/chair-keys";
import { deleteChair } from "@/services/api/mutation/chairs/delete-chair.mutation";

export function useDeleteChair(): UseMutationResult<void, Error, string> {
  const { chairs } = useDictionary();
  return useDeleteMutation({ remove: deleteChair, invalidate: [chairKeys.all, bookingKeys.chairs], messages: chairs.toast });
}
