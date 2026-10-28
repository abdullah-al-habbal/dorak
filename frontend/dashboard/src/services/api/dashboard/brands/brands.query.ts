import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import {
  brandPayload,
  mapBrand,
} from "@/services/api/dashboard/brands/brands.mapper.util";
import type { IBrand } from "@/services/api/dashboard/brands/types/ibrand.types";
import type { IBrandForm } from "@/services/api/dashboard/brands/types/ibrand-form.types";
import type { IDashboardPage } from "@/services/api/dashboard/shared/types/idashboard-page.types";

export const brandsQueryKey = (search: string, page: number) =>
  ["dashboard", "brands", search, page] as const;

export async function getBrands(
  search: string,
  page: number,
): Promise<IDashboardPage<IBrand>> {
  const query = new URLSearchParams({ page: String(page) });
  if (search !== "") query.set("search", search);
  const result = await api.get<IDashboardPage<unknown>>(
    `${DashboardEndpoints.resource("brands")}?${query}`,
  );
  return { ...result, items: result.items.map(mapBrand) };
}

export function createBrand(form: IBrandForm) {
  return api.post<unknown>(
    DashboardEndpoints.resource("brands"),
    brandPayload(form),
  );
}

export function updateBrand(id: string, form: IBrandForm) {
  return api.put<unknown>(
    DashboardEndpoints.resourceById("brands", id),
    brandPayload(form),
  );
}
