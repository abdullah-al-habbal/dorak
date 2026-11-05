import { DASHBOARD_API } from "@/config/routes.constant";
import { serviceListSchema } from "@/schemas/service.zod";
import { pageInfoSchema } from "@/schemas/page-info.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { Service } from "@/types/service.type";

const PER_PAGE = 100;
const MAX_PAGES = 5;

async function fetchPage(search: string | undefined, page: number): Promise<{ items: Service[]; totalPages: number }> {
  const params = new URLSearchParams({ per_page: String(PER_PAGE), page: String(page) });
  if (search) params.set("search", search);
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/services?${params.toString()}`, { schema: serviceListSchema });
  const pagination = pageInfoSchema.safeParse((meta as { pagination?: unknown } | null)?.pagination);
  return { items: data, totalPages: pagination.success ? pagination.data.total_pages : 1 };
}

/** The catalog is grouped client-side, so every page is loaded (bounded by MAX_PAGES). */
export async function fetchServices(search: string | undefined): Promise<Service[]> {
  const first = await fetchPage(search, 1);
  const items = [...first.items];
  for (let page = 2; page <= Math.min(first.totalPages, MAX_PAGES); page += 1) {
    items.push(...(await fetchPage(search, page)).items);
  }
  return items;
}
