import type { BarberStatus } from "@/enums/barber-status.enum";

export interface StylistFilters {
  search?: string;
  chairId?: string;
  status?: BarberStatus;
  page: number;
}
