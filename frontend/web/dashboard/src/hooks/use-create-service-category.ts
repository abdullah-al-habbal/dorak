"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";

import type { ServiceCategoryPayload } from "@/interfaces/service-category-payload.interface";
import { serviceKeys } from "@/lib/service-keys";
import { createServiceCategory } from "@/services/api/mutation/create-service-category.mutation";
import type { ServiceCategory } from "@/types/service-category.type";

export function useCreateServiceCategory(): UseMutationResult<ServiceCategory, Error, ServiceCategoryPayload> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createServiceCategory,
    onSuccess: () => client.invalidateQueries({ queryKey: serviceKeys.categories }),
  });
}
