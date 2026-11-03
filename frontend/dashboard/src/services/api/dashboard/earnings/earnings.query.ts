import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import { mapEarnings } from "@/services/api/dashboard/earnings/earnings.mapper.util";
import type { IEarnings } from "@/services/api/dashboard/earnings/types/iearnings.types";

export async function getEarnings(): Promise<IEarnings> {
  return mapEarnings(await api.get<unknown>(DashboardEndpoints.earnings));
}
