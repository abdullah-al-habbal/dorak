import type { DashboardResource } from "@/services/api/dashboard/shared/types/dashboard-resource.types";

export type EditableDashboardResource = Exclude<
  DashboardResource,
  "overview" | "bookings"
>;
