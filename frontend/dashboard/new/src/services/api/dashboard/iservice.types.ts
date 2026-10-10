import type { DashboardEntityId } from "@/services/api/dashboard/dashboard-entity-id.types";
import type { ILocalizedName } from "@/services/api/dashboard/ilocalized-name.types";

export interface IService {
  id: DashboardEntityId;
  active: boolean;
  catalogItemId: DashboardEntityId | null;
  currencyId: DashboardEntityId;
  duration: number | null;
  name: ILocalizedName;
  price: number;
  serviceableId: DashboardEntityId;
  serviceableType: "branch" | "brand" | "barber";
}
