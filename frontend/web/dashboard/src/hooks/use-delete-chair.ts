"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { bookingKeys } from "@/lib/booking-keys";
import { chairKeys } from "@/lib/chair-keys";
import { deleteChair } from "@/services/api/mutation/delete-chair.mutation";

export function useDeleteChair(): UseMutationResult<void, Error, string> {
  const { chairs } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteChair,
    onSuccess: () => toast.success(chairs.toast.deleted),
    onError: () => toast.error(chairs.toast.deleteFailed),
    onSettled: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: chairKeys.all }), client.invalidateQueries({ queryKey: bookingKeys.chairs })]);
    },
  });
}
