import type { DashboardEntityId } from "@/services/api/dashboard/dashboard-entity-id.types";
import type { ILocalizedName } from "@/services/api/dashboard/ilocalized-name.types";

export interface IStylist {
  id: DashboardEntityId;
  email: string;
  chairId: DashboardEntityId | null;
  name: ILocalizedName;
  phone: string | null;
  status: "pending" | "enabled" | "disabled";
}
