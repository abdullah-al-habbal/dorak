"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/core/query/use-delete-mutation";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { stylistKeys } from "@/lib/query-keys/stylists/stylist-keys";
import { deleteStylist } from "@/services/api/mutation/stylists/delete-stylist.mutation";

export function useDeleteStylist(): UseMutationResult<void, Error, string> {
  const { stylists } = useDictionary();
  return useDeleteMutation({ remove: deleteStylist, invalidate: [stylistKeys.all], messages: stylists.toast });
}
