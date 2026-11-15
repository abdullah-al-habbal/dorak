import { CHAIR_PER_PAGE } from "@/config/chair-layout.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { chairQueryString } from "@/lib/chairs/chair-filters.util";
import { resolvePageInfo } from "@/lib/core/resolve-page-info.util";
import { chairListSchema } from "@/schemas/chair.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { ChairFilters } from "@/types/chairs/chair-filters.type";
import type { ChairPage } from "@/types/chairs/chair-page.type";

export async function fetchChairPage(filters: ChairFilters): Promise<ChairPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/chairs?${chairQueryString(filters, CHAIR_PER_PAGE)}`, { schema: chairListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, CHAIR_PER_PAGE, filters.page) };
}
