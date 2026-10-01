export interface DashboardPagination {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface DashboardPage<TItem> {
  items: TItem[];
  pagination: DashboardPagination;
}
