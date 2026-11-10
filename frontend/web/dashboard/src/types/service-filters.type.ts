/** The catalog is grouped client-side, so there is no paging; `page` only satisfies the shared URL-filter hook. */
export interface ServiceFilters {
  search?: string;
  /** Narrows the list to one brand; only the platform admin sees several. */
  brandId?: string;
  page: number;
}
