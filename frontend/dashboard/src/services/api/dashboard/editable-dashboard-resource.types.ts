import type { DashboardResource } from "@/services/api/dashboard/dashboard-resource.types";

export type EditableDashboardResource = Exclude<
  DashboardResource,
  "overview" | "bookings"
>;
