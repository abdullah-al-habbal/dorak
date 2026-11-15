import type { ReviewFilters } from "@/types/clients/review-filters.type";

export function reviewFiltersFromParams(params: URLSearchParams): ReviewFilters {
  const page = Number(params.get("page"));
  return { branchId: params.get("branch") || undefined, page: Number.isInteger(page) && page > 0 ? page : 1 };
}

export function reviewFiltersToParams(filters: ReviewFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.branchId) params.set("branch", filters.branchId);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}
