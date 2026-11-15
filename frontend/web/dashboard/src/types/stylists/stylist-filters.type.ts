import type { BarberStatus } from "@/enums/barber-status.enum";

export interface StylistFilters {
  search?: string;
  chairId?: string;
  branchId?: string;
  status?: BarberStatus;
  page: number;
}
