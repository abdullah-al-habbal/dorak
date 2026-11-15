"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { adminBrandKeys } from "@/lib/query-keys/brands/admin-brand-keys";
import { fetchAdminBrand } from "@/services/api/query/brands/admin-brand.query";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

/** The detail dialog's read. It starts from the list row, so the dialog never opens empty. */
export function useAdminBrand(brand: AdminBrand): UseQueryResult<AdminBrand> {
  return useQuery({ queryKey: adminBrandKeys.detail(brand.id), queryFn: () => fetchAdminBrand(brand.id), placeholderData: brand });
}
