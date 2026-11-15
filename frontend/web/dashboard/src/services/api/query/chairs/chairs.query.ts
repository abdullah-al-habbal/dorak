import { DASHBOARD_API } from "@/config/routes.constant";
import { chairOptionListSchema } from "@/schemas/chairs/chair.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ChairOption } from "@/types/chairs/chair-option.type";

const MAX_PER_PAGE = 100;

export function fetchChairs(): Promise<ChairOption[]> {
  return apiRequest(`${DASHBOARD_API}/chairs?per_page=${MAX_PER_PAGE}`, { schema: chairOptionListSchema });
}
