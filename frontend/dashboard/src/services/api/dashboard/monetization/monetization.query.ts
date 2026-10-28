import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import {
  assignPayload,
  commissionRulePayload,
  gatewayActivePayload,
  gatewayPayload,
  mapAnalytics,
  mapCommissionEntry,
  mapCommissionRule,
  mapGateway,
  mapPayout,
  mapPlan,
  mapSubscription,
  planPayload,
} from "@/services/api/dashboard/monetization/monetization.mapper.util";
import type { IAnalytics } from "@/services/api/dashboard/monetization/types/ianalytics.types";
import type { IAssignSubscriptionForm } from "@/services/api/dashboard/monetization/types/iassign-subscription-form.types";
import type { ICommissionEntry } from "@/services/api/dashboard/monetization/types/icommission-entry.types";
import type { ICommissionRule } from "@/services/api/dashboard/monetization/types/icommission-rule.types";
import type { ICommissionRuleForm } from "@/services/api/dashboard/monetization/types/icommission-rule-form.types";
import type { IGateway } from "@/services/api/dashboard/monetization/types/igateway.types";
import type { IGatewayForm } from "@/services/api/dashboard/monetization/types/igateway-form.types";
import type { IPayout } from "@/services/api/dashboard/monetization/types/ipayout.types";
import type { IPlan } from "@/services/api/dashboard/monetization/types/iplan.types";
import type { IPlanForm } from "@/services/api/dashboard/monetization/types/iplan-form.types";
import type { ISubscription } from "@/services/api/dashboard/monetization/types/isubscription.types";
import type { IDashboardPage } from "@/services/api/dashboard/shared/types/idashboard-page.types";

export const pagedQueryKey = (
  base: readonly string[],
  page: number,
  extra = "",
) => [...base, page, extra] as const;

async function paged<T>(
  url: string,
  page: number,
  map: (wire: unknown) => T,
): Promise<IDashboardPage<T>> {
  const result = await api.get<IDashboardPage<unknown>>(
    `${url}?${new URLSearchParams({ page: String(page) })}`,
  );
  return { ...result, items: result.items.map(map) };
}

export const getPlans = (page: number): Promise<IDashboardPage<IPlan>> =>
  paged(DashboardEndpoints.adminPlans, page, mapPlan);
export const getSubscriptions = (
  page: number,
): Promise<IDashboardPage<ISubscription>> =>
  paged(DashboardEndpoints.adminSubscriptions, page, mapSubscription);
export const getCommissionRules = (
  page: number,
): Promise<IDashboardPage<ICommissionRule>> =>
  paged(DashboardEndpoints.adminCommissionRules, page, mapCommissionRule);
export const getCommissionEntries = (
  page: number,
): Promise<IDashboardPage<ICommissionEntry>> =>
  paged(DashboardEndpoints.adminCommissionEntries, page, mapCommissionEntry);
export const getPayouts = (page: number): Promise<IDashboardPage<IPayout>> =>
  paged(DashboardEndpoints.adminPayouts, page, mapPayout);

export async function getGateways(): Promise<IGateway[]> {
  const result = await api.get<unknown[]>(DashboardEndpoints.adminGateways);
  return result.map(mapGateway);
}

export async function getPlanFeatureKeys(): Promise<string[]> {
  const result = await api.get<unknown[]>(
    DashboardEndpoints.adminPlanFeatureKeys,
  );
  return result.filter((key): key is string => typeof key === "string");
}

export async function getAnalytics(): Promise<IAnalytics> {
  return mapAnalytics(
    await api.get<unknown>(DashboardEndpoints.adminAnalytics),
  );
}

export const savePlan = (form: IPlanForm, id?: string) =>
  id
    ? api.put<unknown>(DashboardEndpoints.adminPlan(id), planPayload(form))
    : api.post<unknown>(DashboardEndpoints.adminPlans, planPayload(form));
export const deletePlan = (id: string) =>
  api.delete<unknown>(DashboardEndpoints.adminPlan(id));

export const assignSubscription = (form: IAssignSubscriptionForm) =>
  api.post<unknown>(DashboardEndpoints.adminSubscriptions, assignPayload(form));
export const updateSubscriptionStatus = (input: {
  id: string;
  status: string;
}) =>
  api.patch<unknown>(DashboardEndpoints.adminSubscriptionStatus(input.id), {
    status: input.status,
  });

export const saveGateway = (form: IGatewayForm, id?: string) =>
  id
    ? api.put<unknown>(
        DashboardEndpoints.adminGateway(id),
        gatewayPayload(form),
      )
    : api.post<unknown>(DashboardEndpoints.adminGateways, gatewayPayload(form));
export const setGatewayActive = (input: { id: string; isActive: boolean }) =>
  api.patch<unknown>(
    DashboardEndpoints.adminGatewayActive(input.id),
    gatewayActivePayload(input.isActive),
  );
export const deleteGateway = (id: string) =>
  api.delete<unknown>(DashboardEndpoints.adminGateway(id));

export const saveCommissionRule = (form: ICommissionRuleForm, id?: string) =>
  id
    ? api.put<unknown>(
        DashboardEndpoints.adminCommissionRule(id),
        commissionRulePayload(form),
      )
    : api.post<unknown>(
        DashboardEndpoints.adminCommissionRules,
        commissionRulePayload(form),
      );
export const deleteCommissionRule = (id: string) =>
  api.delete<unknown>(DashboardEndpoints.adminCommissionRule(id));

export const generatePayouts = () =>
  api.post<unknown>(DashboardEndpoints.adminPayoutsGenerate);
export const transitionPayout = (input: { id: string; action: string }) =>
  api.patch<unknown>(
    DashboardEndpoints.adminPayoutAction(input.id, input.action),
  );
