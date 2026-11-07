import { CHAIR_PER_PAGE } from "@/config/chair-layout.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { chairQueryString } from "@/lib/chair-filters.util";
import { chairListSchema } from "@/schemas/chair.zod";
import { pageInfoSchema } from "@/schemas/page-info.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { ChairFilters } from "@/types/chair-filters.type";
import type { ChairPage } from "@/types/chair-page.type";

export async function fetchChairPage(filters: ChairFilters): Promise<ChairPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/chairs?${chairQueryString(filters, CHAIR_PER_PAGE)}`, { schema: chairListSchema });
  const pagination = pageInfoSchema.safeParse((meta as { pagination?: unknown } | null)?.pagination);
  const fallback = { total: data.length, per_page: CHAIR_PER_PAGE, current_page: filters.page, total_pages: 1 };
  return { items: data, page: pagination.success ? pagination.data : fallback };
}
