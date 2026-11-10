import type { BarberStatusFilter } from "@/types/barber-status-filter.type";

export interface BarberApprovalFilters {
  status: BarberStatusFilter;
  search?: string;
  page: number;
}
