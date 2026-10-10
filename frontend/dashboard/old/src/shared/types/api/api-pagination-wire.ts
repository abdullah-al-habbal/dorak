/** Pagination block the backend emits; translated to `DashboardPagination`. */
export interface ApiPaginationWire {
  count: number;
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}
