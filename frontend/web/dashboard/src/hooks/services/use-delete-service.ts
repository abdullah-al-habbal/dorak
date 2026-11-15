"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/core/use-delete-mutation";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { deleteService } from "@/services/api/mutation/save-service.mutation";

export function useDeleteService(): UseMutationResult<void, Error, string> {
  const { services } = useDictionary();
  return useDeleteMutation({ remove: deleteService, invalidate: [serviceKeys.all], messages: services.toast });
}
