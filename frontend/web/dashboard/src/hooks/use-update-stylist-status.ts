"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { BarberStatus } from "@/enums/barber-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { withStylistStatus } from "@/lib/stylist-cache.util";
import { stylistKeys } from "@/lib/stylist-keys";
import { setStylistActive } from "@/services/api/mutation/toggle-stylist.mutation";
import type { StylistPage } from "@/types/stylist-page.type";
import type { Stylist } from "@/types/stylist.type";

interface ToggleVariables {
  id: string;
  active: boolean;
}

interface ToggleContext {
  snapshots: [readonly unknown[], StylistPage | undefined][];
}

/** Flips the status in every cached list at once, rolls back on failure, then refetches. */
export function useUpdateStylistStatus(): UseMutationResult<Stylist, Error, ToggleVariables, ToggleContext> {
  const { stylists } = useDictionary();
  const client = useQueryClient();

  return useMutation<Stylist, Error, ToggleVariables, ToggleContext>({
    mutationFn: ({ id, active }) => setStylistActive(id, active),
    onMutate: async ({ id, active }) => {
      await client.cancelQueries({ queryKey: stylistKeys.all });
      const snapshots = client.getQueriesData<StylistPage>({ queryKey: stylistKeys.all });
      const status = active ? BarberStatus.Enabled : BarberStatus.Disabled;
      client.setQueriesData<StylistPage>({ queryKey: stylistKeys.all }, (page) => withStylistStatus(page, id, status));
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) => client.setQueryData(key, data));
      toast.error(stylists.toast.failed);
    },
    onSuccess: (_data, { active }) => toast.success(active ? stylists.toast.activated : stylists.toast.deactivated),
    onSettled: () => client.invalidateQueries({ queryKey: stylistKeys.all }),
  });
}
