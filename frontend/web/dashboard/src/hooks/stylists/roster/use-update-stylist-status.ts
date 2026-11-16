"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { BarberStatus } from "@/enums/people/barber-status.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useOptimisticToggleMutation } from "@/hooks/core/query/use-optimistic-toggle-mutation";
import type { OptimisticToggleContext } from "@/interfaces/core/query/optimistic-toggle-context.interface";
import { withStylistStatus } from "@/lib/stylists/stylist-cache.util";
import { stylistKeys } from "@/lib/query-keys/stylists/stylist-keys";
import { setStylistActive } from "@/services/api/mutation/stylists/toggle-stylist.mutation";
import type { StylistPage } from "@/types/stylists/stylist-page.type";
import type { Stylist } from "@/types/stylists/stylist.type";

interface ToggleVariables {
  id: string;
  active: boolean;
  reason?: string;
}

/** Flips the status in every cached list at once, rolls back on failure, then refetches. */
export function useUpdateStylistStatus(): UseMutationResult<Stylist, Error, ToggleVariables, OptimisticToggleContext<StylistPage>> {
  const { stylists } = useDictionary();

  return useOptimisticToggleMutation<Stylist, ToggleVariables, StylistPage>({
    queryKey: stylistKeys.all,
    mutationFn: ({ id, active, reason }) => setStylistActive(id, active, reason),
    patch: (page, { id, active }) => withStylistStatus(page, id, active ? BarberStatus.Enabled : BarberStatus.Disabled),
    successMessage: ({ active }) => (active ? stylists.toast.activated : stylists.toast.deactivated),
    failureMessage: stylists.toast.failed,
  });
}
