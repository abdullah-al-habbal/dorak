"use client";

import { getLookupOptions } from "@/services/api/common/lookup/lookup.query";
import type { LookupResource } from "@/services/api/common/lookup/types/lookup.types";
import { useQuery } from "@tanstack/react-query";

export function useLookupOptionsQuery(resource: LookupResource) {
  return useQuery({
    queryKey: ["lookups", resource],
    queryFn: () => getLookupOptions(resource),
  });
}
