import type { DASHBOARD_RESOURCES } from "@/services/api/dashboard/dashboard-resource.constant";

export type DashboardResource = (typeof DASHBOARD_RESOURCES)[number];
