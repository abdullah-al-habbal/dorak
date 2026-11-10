"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { ownerBrandKeys } from "@/lib/owner-brand-keys";
import { fetchOwnerBrands } from "@/services/api/query/owner-brands.query";
import type { AdminBrand } from "@/types/admin-brand.type";

/** Always fresh on open: an approval can land at any moment and the owner is waiting for it. */
export function useOwnerBrands(): UseQueryResult<AdminBrand[]> {
  return useQuery({ queryKey: ownerBrandKeys.mine, queryFn: fetchOwnerBrands });
}
