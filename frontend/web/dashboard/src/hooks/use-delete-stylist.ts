"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { stylistKeys } from "@/lib/stylist-keys";
import { deleteStylist } from "@/services/api/mutation/delete-stylist.mutation";

export function useDeleteStylist(): UseMutationResult<void, Error, string> {
  const { stylists } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteStylist,
    onSuccess: () => toast.success(stylists.toast.deleted),
    onError: () => toast.error(stylists.toast.deleteFailed),
    onSettled: () => client.invalidateQueries({ queryKey: stylistKeys.all }),
  });
}
