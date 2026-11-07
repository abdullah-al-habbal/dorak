"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { ChairStatus } from "@/enums/chair-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { withChairStatus } from "@/lib/chair-cache.util";
import { statusChangePayload } from "@/lib/chair-form.util";
import { chairKeys } from "@/lib/chair-keys";
import { updateChair } from "@/services/api/mutation/save-chair.mutation";
import type { ChairPage } from "@/types/chair-page.type";
import type { Chair } from "@/types/chair.type";

interface StatusVariables {
  chair: Chair;
  status: ChairStatus;
  /** Cancels the chair's future bookings when moving it to maintenance. */
  force?: boolean;
}

interface StatusContext {
  snapshots: [readonly unknown[], ChairPage | undefined][];
}

/** Flips the status in every cached list at once, rolls back on failure, then refetches. */
export function useUpdateChairStatus(): UseMutationResult<Chair, Error, StatusVariables, StatusContext> {
  const { chairs } = useDictionary();
  const client = useQueryClient();

  return useMutation<Chair, Error, StatusVariables, StatusContext>({
    mutationFn: ({ chair, status, force = false }) => updateChair(chair.id, statusChangePayload(chair, status, force)),
    onMutate: async ({ chair, status }) => {
      await client.cancelQueries({ queryKey: chairKeys.all });
      const snapshots = client.getQueriesData<ChairPage>({ queryKey: chairKeys.all });
      client.setQueriesData<ChairPage>({ queryKey: chairKeys.all }, (page) => withChairStatus(page, chair.id, status));
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) => client.setQueryData(key, data));
    },
    onSuccess: (_data, { status }) => toast.success(status === ChairStatus.Maintenance ? chairs.toast.maintenance : chairs.toast.inService),
    onSettled: () => client.invalidateQueries({ queryKey: chairKeys.all }),
  });
}
