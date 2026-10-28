import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import { mapBrand } from "@/services/api/dashboard/brands/brands.mapper.util";
import type {
  IBrand,
  IBrandForm,
} from "@/services/api/dashboard/brands/types/ibrands.types";
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

export function brandPayload(form: IBrandForm) {
  return {
    name: { en: form.nameEn, ar: form.nameAr },
    description: {
      en: form.descriptionEn === "" ? null : form.descriptionEn,
      ar: form.descriptionAr === "" ? null : form.descriptionAr,
    },
    logo: form.logo === "" ? null : form.logo,
    base_currency_id: form.baseCurrencyId,
    universe: form.universe,
  };
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
