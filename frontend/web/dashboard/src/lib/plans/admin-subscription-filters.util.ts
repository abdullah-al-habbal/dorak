import { SubscriptionStatus } from "@/enums/money/subscription-status.enum";
import { parseEnumValue } from "@/lib/core/parse/enum-value.util";
import type { AdminSubscriptionFilters } from "@/types/plans/admin-subscription-filters.type";


export function adminSubscriptionFiltersFromParams(params: URLSearchParams): AdminSubscriptionFilters {
  const page = Number(params.get("page"));
  const status = params.get("status") ?? "";
  return {
    status: parseEnumValue(SubscriptionStatus, status),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function adminSubscriptionFiltersToParams(filters: AdminSubscriptionFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}
