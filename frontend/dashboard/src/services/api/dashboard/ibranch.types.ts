import type { DashboardEntityId } from "@/services/api/dashboard/dashboard-entity-id.types";
import type { IBranchOpeningDay } from "@/services/api/dashboard/ibranch-opening-day.types";
import type { ILocalizedName } from "@/services/api/dashboard/ilocalized-name.types";

export interface IBranch {
  id: DashboardEntityId;
  brandId: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  name: ILocalizedName;
  description: ILocalizedName;
  address: ILocalizedName;
  tags: string[];
  openingHours: IBranchOpeningDay[];
  ratingAvg: number | null;
  ratingCount: number;
  status: "pending" | "enabled" | "disabled";
  universe: "men" | "women" | "unisex";
}
