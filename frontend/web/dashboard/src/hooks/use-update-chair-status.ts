"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { ChairStatus } from "@/enums/chair-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { useOptimisticToggleMutation } from "@/hooks/use-optimistic-toggle-mutation";
import type { OptimisticToggleContext } from "@/interfaces/optimistic-toggle-context.interface";
import { withChairStatus } from "@/lib/chair-cache.util";
import { statusChangePayload } from "@/lib/chair-form.util";
import { chairKeys } from "@/lib/query-keys/chairs/chair-keys";
import { updateChair } from "@/services/api/mutation/save-chair.mutation";
import type { ChairPage } from "@/types/chair-page.type";
import type { Chair } from "@/types/chair.type";

interface StatusVariables {
  chair: Chair;
  status: ChairStatus;
  /** Cancels the chair's future bookings when moving it to maintenance. */
  force?: boolean;
}

/** Flips the status in every cached list at once, rolls back on failure, then refetches. No failure toast: `useChairStatusToggle` handles the 409. */
export function useUpdateChairStatus(): UseMutationResult<Chair, Error, StatusVariables, OptimisticToggleContext<ChairPage>> {
  const { chairs } = useDictionary();

  return useOptimisticToggleMutation<Chair, StatusVariables, ChairPage>({
    queryKey: chairKeys.all,
    mutationFn: ({ chair, status, force = false }) => updateChair(chair.id, statusChangePayload(chair, status, force)),
    patch: (page, { chair, status }) => withChairStatus(page, chair.id, status),
    successMessage: ({ status }) => (status === ChairStatus.Maintenance ? chairs.toast.maintenance : chairs.toast.inService),
  });
}
