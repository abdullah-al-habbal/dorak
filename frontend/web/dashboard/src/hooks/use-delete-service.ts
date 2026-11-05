"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { serviceKeys } from "@/lib/service-keys";
import { deleteService } from "@/services/api/mutation/save-service.mutation";

export function useDeleteService(): UseMutationResult<void, Error, string> {
  const { services } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => toast.success(services.toast.deleted),
    onError: () => toast.error(services.toast.deleteFailed),
    onSettled: () => client.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}
