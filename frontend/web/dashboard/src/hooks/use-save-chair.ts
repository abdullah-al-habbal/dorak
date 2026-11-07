"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import type { ChairPayload } from "@/interfaces/chair-payload.interface";
import { bookingKeys } from "@/lib/booking-keys";
import { chairKeys } from "@/lib/chair-keys";
import { createChair, updateChair } from "@/services/api/mutation/save-chair.mutation";
import type { Chair } from "@/types/chair.type";

interface SaveVariables {
  /** Present when editing. */
  id?: string;
  payload: ChairPayload;
}

export function useSaveChair(): UseMutationResult<Chair, Error, SaveVariables> {
  const { chairs } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: SaveVariables) => (id ? updateChair(id, payload) : createChair(payload)),
    onSuccess: (_data, { id }) => toast.success(id ? chairs.toast.updated : chairs.toast.created),
    onSettled: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: chairKeys.all }), client.invalidateQueries({ queryKey: bookingKeys.chairs })]);
    },
  });
}
