import { PayoutStatus } from "@/enums/money/payout-status.enum";
import { parseEnumValue } from "@/lib/core/parse/enum-value.util";
import type { PayoutFilters } from "@/types/earnings/payout-filters.type";


export function payoutFiltersFromParams(params: URLSearchParams): PayoutFilters {
  const page = Number(params.get("page"));
  const status = params.get("status") ?? "";
  return {
    status: parseEnumValue(PayoutStatus, status),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function payoutFiltersToParams(filters: PayoutFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}
