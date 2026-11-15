"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useSaveMutation } from "@/hooks/core/use-save-mutation";
import type { ServicePayload } from "@/interfaces/services/service-payload.interface";
import type { SaveVariables } from "@/interfaces/core/save-variables.interface";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { createService, updateService } from "@/services/api/mutation/save-service.mutation";
import type { Service } from "@/types/services/service.type";

export function useSaveService(): UseMutationResult<Service, Error, SaveVariables<ServicePayload>> {
  const { services } = useDictionary();
  return useSaveMutation({ create: createService, update: updateService, invalidate: [serviceKeys.all], messages: services.toast });
}
