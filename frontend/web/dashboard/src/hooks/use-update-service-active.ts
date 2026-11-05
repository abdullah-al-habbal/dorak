"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { activeTogglePayload } from "@/lib/service-form.util";
import { withServiceActive } from "@/lib/service-cache.util";
import { serviceKeys } from "@/lib/service-keys";
import { updateService } from "@/services/api/mutation/save-service.mutation";
import type { Service } from "@/types/service.type";

interface ToggleVariables {
  service: Service;
  active: boolean;
}

interface ToggleContext {
  snapshots: [readonly unknown[], Service[] | undefined][];
}

/** The backend has no partial update, so this PUTs the full service with one flag flipped. */
export function useUpdateServiceActive(): UseMutationResult<Service, Error, ToggleVariables, ToggleContext> {
  const { services } = useDictionary();
  const client = useQueryClient();

  return useMutation<Service, Error, ToggleVariables, ToggleContext>({
    mutationFn: ({ service, active }) => updateService(service.id, activeTogglePayload(service, active)),
    onMutate: async ({ service, active }) => {
      await client.cancelQueries({ queryKey: serviceKeys.all });
      const snapshots = client.getQueriesData<Service[]>({ queryKey: serviceKeys.all });
      client.setQueriesData<Service[]>({ queryKey: serviceKeys.all }, (list) => withServiceActive(list, service.id, active));
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) => client.setQueryData(key, data));
      toast.error(services.toast.failed);
    },
    onSuccess: (_data, { active }) => toast.success(active ? services.toast.activated : services.toast.deactivated),
    onSettled: () => client.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}
