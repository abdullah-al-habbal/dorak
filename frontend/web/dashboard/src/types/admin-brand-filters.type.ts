import type { BrandStatusFilter } from "@/types/brand-status-filter.type";

export interface AdminBrandFilters {
  status: BrandStatusFilter;
  search?: string;
  page: number;
}
