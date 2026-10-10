import type { IDashboardPagination } from "@/services/api/dashboard/idashboard-pagination.types";

export interface IDashboardPage<TItem> {
  items: TItem[];
  pagination: IDashboardPagination;
}
