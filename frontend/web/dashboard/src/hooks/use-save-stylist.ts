"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useSaveMutation } from "@/hooks/use-save-mutation";
import type { StylistPayload } from "@/interfaces/stylist-payload.interface";
import type { SaveVariables } from "@/interfaces/save-variables.interface";
import { stylistKeys } from "@/lib/stylist-keys";
import { createStylist, updateStylist } from "@/services/api/mutation/save-stylist.mutation";
import type { Stylist } from "@/types/stylist.type";

export function useSaveStylist(): UseMutationResult<Stylist, Error, SaveVariables<StylistPayload>> {
  const { stylists } = useDictionary();
  return useSaveMutation({ create: createStylist, update: updateStylist, invalidate: [stylistKeys.all], messages: stylists.toast });
}
