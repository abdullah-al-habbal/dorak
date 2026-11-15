"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useOptimisticToggleMutation } from "@/hooks/core/query/use-optimistic-toggle-mutation";
import type { OptimisticToggleContext } from "@/interfaces/core/query/optimistic-toggle-context.interface";
import { activeTogglePayload } from "@/lib/services/service-form.util";
import { withServiceActive } from "@/lib/services/service-cache.util";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { updateService } from "@/services/api/mutation/services/save-service.mutation";
import type { Service } from "@/types/services/service.type";

interface ToggleVariables {
  service: Service;
  active: boolean;
}

/** The backend has no partial update, so this PUTs the full service with one flag flipped. */
export function useUpdateServiceActive(): UseMutationResult<Service, Error, ToggleVariables, OptimisticToggleContext<Service[]>> {
  const { services } = useDictionary();

  return useOptimisticToggleMutation<Service, ToggleVariables, Service[]>({
    queryKey: serviceKeys.all,
    mutationFn: ({ service, active }) => updateService(service.id, activeTogglePayload(service, active)),
    patch: (list, { service, active }) => withServiceActive(list, service.id, active),
    successMessage: ({ active }) => (active ? services.toast.activated : services.toast.deactivated),
    failureMessage: services.toast.failed,
  });
}
