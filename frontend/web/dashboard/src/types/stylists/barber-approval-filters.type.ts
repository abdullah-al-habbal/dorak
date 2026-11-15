import type { BarberStatusFilter } from "@/types/stylists/barber-status-filter.type";

export interface BarberApprovalFilters {
  status: BarberStatusFilter;
  search?: string;
  page: number;
}
