"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import type { ServicePayload } from "@/interfaces/service-payload.interface";
import { serviceKeys } from "@/lib/service-keys";
import { createService, updateService } from "@/services/api/mutation/save-service.mutation";
import type { Service } from "@/types/service.type";

interface SaveVariables {
  /** Present when editing. */
  id?: string;
  payload: ServicePayload;
}

export function useSaveService(): UseMutationResult<Service, Error, SaveVariables> {
  const { services } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: SaveVariables) => (id ? updateService(id, payload) : createService(payload)),
    onSuccess: (_data, { id }) => toast.success(id ? services.toast.updated : services.toast.created),
    onSettled: () => client.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}
