"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { stylistKeys } from "@/lib/stylist-keys";
import { deleteStylist } from "@/services/api/mutation/delete-stylist.mutation";

export function useDeleteStylist(): UseMutationResult<void, Error, string> {
  const { stylists } = useDictionary();
  return useDeleteMutation({ remove: deleteStylist, invalidate: [stylistKeys.all], messages: stylists.toast });
}
