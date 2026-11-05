import type { IDashboardPage } from "@/services/api/dashboard/shared/types/idashboard-page.types";
import type { IDashboardPagination } from "@/services/api/dashboard/shared/types/idashboard-pagination.types";
import { isRecord } from "@/utils/guards.util";

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function dashboardPage<TItem>(
  items: TItem[],
  meta: unknown,
): IDashboardPage<TItem> {
  const pagination =
    isRecord(meta) && isRecord(meta.pagination) ? meta.pagination : {};
  const currentPage = numberValue(pagination.current_page, 1);
  const perPage = numberValue(pagination.per_page, items.length);
  const total = numberValue(pagination.total, items.length);
  const totalPages = numberValue(pagination.total_pages, 1);
  const normalized: IDashboardPagination = {
    currentPage,
    perPage,
    total,
    totalPages,
  };

  return { items, pagination: normalized };
}
