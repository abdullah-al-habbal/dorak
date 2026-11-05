import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import {
  mapOwnerPayout,
  mapOwnerSubscription,
} from "@/services/api/dashboard/owner-billing/owner-billing.mapper.util";
import type { IOwnerPayout } from "@/services/api/dashboard/owner-billing/types/iowner-payout.types";
import type { IOwnerSubscription } from "@/services/api/dashboard/owner-billing/types/iowner-subscription.types";
import type { IDashboardPage } from "@/services/api/dashboard/shared/types/idashboard-page.types";

export async function getOwnerSubscriptions(): Promise<IOwnerSubscription[]> {
  const result = await api.get<unknown[]>(DashboardEndpoints.ownerSubscription);
  return result.map(mapOwnerSubscription);
}

export async function getOwnerPayouts(
  page: number,
): Promise<IDashboardPage<IOwnerPayout>> {
  const result = await api.get<IDashboardPage<unknown>>(
    `${DashboardEndpoints.ownerPayouts}?${new URLSearchParams({ page: String(page) })}`,
  );
  return { ...result, items: result.items.map(mapOwnerPayout) };
}
