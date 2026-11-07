"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { bookingKeys } from "@/lib/booking-keys";
import { chairKeys } from "@/lib/chair-keys";
import { deleteChair } from "@/services/api/mutation/delete-chair.mutation";

export function useDeleteChair(): UseMutationResult<void, Error, string> {
  const { chairs } = useDictionary();
  return useDeleteMutation({ remove: deleteChair, invalidate: [chairKeys.all, bookingKeys.chairs], messages: chairs.toast });
}
