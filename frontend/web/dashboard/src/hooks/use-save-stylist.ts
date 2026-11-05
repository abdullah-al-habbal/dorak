"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import type { StylistPayload } from "@/interfaces/stylist-payload.interface";
import { stylistKeys } from "@/lib/stylist-keys";
import { createStylist, updateStylist } from "@/services/api/mutation/save-stylist.mutation";
import type { Stylist } from "@/types/stylist.type";

interface SaveVariables {
  /** Present when editing. */
  id?: string;
  payload: StylistPayload;
}

export function useSaveStylist(): UseMutationResult<Stylist, Error, SaveVariables> {
  const { stylists } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: SaveVariables) => (id ? updateStylist(id, payload) : createStylist(payload)),
    onSuccess: (_data, { id }) => toast.success(id ? stylists.toast.updated : stylists.toast.created),
    onSettled: () => client.invalidateQueries({ queryKey: stylistKeys.all }),
  });
}
