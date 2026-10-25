"use client";

import { getLookupOptions } from "@/services/api/lookup.query";
import type { LookupResource } from "@/services/api/lookup.types";
import { useQuery } from "@tanstack/react-query";

export function useLookupOptionsQuery(resource: LookupResource) {
  return useQuery({
    queryKey: ["lookups", resource],
    queryFn: () => getLookupOptions(resource),
  });
}
