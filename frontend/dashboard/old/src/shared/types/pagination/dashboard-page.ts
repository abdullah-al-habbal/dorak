import type { DashboardPagination } from './dashboard-pagination';

export interface DashboardPage<TItem> {
  items: TItem[];
  pagination: DashboardPagination;
}
