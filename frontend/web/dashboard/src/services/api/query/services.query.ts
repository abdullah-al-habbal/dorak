import { DASHBOARD_API } from "@/config/routes.constant";
import { serviceListSchema } from "@/schemas/service.zod";
import { pageInfoSchema } from "@/schemas/page-info.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { ServiceFilters } from "@/types/services/service-filters.type";
import type { Service } from "@/types/services/service.type";

const PER_PAGE = 100;
const MAX_PAGES = 5;

async function fetchPage(filters: ServiceFilters, page: number): Promise<{ items: Service[]; totalPages: number }> {
  const params = new URLSearchParams({ per_page: String(PER_PAGE), page: String(page) });
  if (filters.search) params.set("search", filters.search);
  if (filters.brandId) params.set("brand_id", filters.brandId);
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/services?${params.toString()}`, { schema: serviceListSchema });
  const pagination = pageInfoSchema.safeParse((meta as { pagination?: unknown } | null)?.pagination);
  return { items: data, totalPages: pagination.success ? pagination.data.total_pages : 1 };
}

/** The catalog is grouped client-side, so every page is loaded (bounded by MAX_PAGES). */
export async function fetchServices(filters: ServiceFilters): Promise<Service[]> {
  const first = await fetchPage(filters, 1);
  const items = [...first.items];
  for (let page = 2; page <= Math.min(first.totalPages, MAX_PAGES); page += 1) {
    items.push(...(await fetchPage(filters, page)).items);
  }
  return items;
}
