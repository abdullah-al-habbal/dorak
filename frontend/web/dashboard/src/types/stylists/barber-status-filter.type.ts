import type { BARBER_STATUS_FILTER_ALL } from "@/config/ops/barber-approval.constant";
import type { BarberStatus } from "@/enums/people/barber-status.enum";

export type BarberStatusFilter = BarberStatus | typeof BARBER_STATUS_FILTER_ALL;
