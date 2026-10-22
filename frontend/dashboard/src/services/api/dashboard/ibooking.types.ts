import type { BookingStatus } from "@/services/api/dashboard/booking-status.types";
import type { DashboardEntityId } from "@/services/api/dashboard/dashboard-entity-id.types";
import type { ILocalizedName } from "@/services/api/dashboard/ilocalized-name.types";

export interface IBooking {
  id: DashboardEntityId;
  barber: { name: Pick<ILocalizedName, "en"> } | null;
  chair: { label: string | null } | null;
  client: {
    name: string | null;
    reputation: { average: number | null; count: number };
  } | null;
  endsAt: string | null;
  services: Array<{ name: Pick<ILocalizedName, "en"> }>;
  status: BookingStatus;
  timeSlot: string;
}
