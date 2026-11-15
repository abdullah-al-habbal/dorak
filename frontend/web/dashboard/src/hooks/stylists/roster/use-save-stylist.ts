"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useSaveMutation } from "@/hooks/core/query/use-save-mutation";
import type { StylistPayload } from "@/interfaces/stylists/stylist-payload.interface";
import type { SaveVariables } from "@/interfaces/core/query/save-variables.interface";
import { stylistKeys } from "@/lib/query-keys/stylists/stylist-keys";
import { createStylist, updateStylist } from "@/services/api/mutation/stylists/save-stylist.mutation";
import type { Stylist } from "@/types/stylists/stylist.type";

export function useSaveStylist(): UseMutationResult<Stylist, Error, SaveVariables<StylistPayload>> {
  const { stylists } = useDictionary();
  return useSaveMutation({ create: createStylist, update: updateStylist, invalidate: [stylistKeys.all], messages: stylists.toast });
}
