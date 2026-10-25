import type { DASHBOARD_RESOURCES } from "@/services/api/dashboard/shared/dashboard-resource.constant";

export type DashboardResource = (typeof DASHBOARD_RESOURCES)[number];
