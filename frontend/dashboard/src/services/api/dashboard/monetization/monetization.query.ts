import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import {
  mapAnalytics,
  mapCommissionEntry,
  mapCommissionRule,
  mapGateway,
  mapPayout,
  mapPlan,
  mapSubscription,
} from "@/services/api/dashboard/monetization/monetization.mapper.util";
import {
  parseConfigLines,
  percentToBasisPoints,
  toMinorUnits,
} from "@/services/api/dashboard/monetization/monetization.util";
import type {
  IAnalytics,
  IAssignSubscriptionForm,
  ICommissionEntry,
  ICommissionRule,
  ICommissionRuleForm,
  IGateway,
  IGatewayForm,
  IPayout,
  IPlan,
  IPlanForm,
  ISubscription,
} from "@/services/api/dashboard/monetization/types/imonetization.types";
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

export function planPayload(form: IPlanForm) {
  return {
    name: { en: form.nameEn, ar: form.nameAr },
    description: {
      en: form.descriptionEn === "" ? null : form.descriptionEn,
      ar: form.descriptionAr === "" ? null : form.descriptionAr,
    },
    price_minor: toMinorUnits(form.price),
    currency_id: form.currencyId,
    interval_unit: form.intervalUnit,
    interval_count: form.intervalCount,
    is_active: form.isActive,
    feature_keys: form.featureKeys,
  };
}

export const savePlan = (form: IPlanForm, id?: string) =>
  id
    ? api.put<unknown>(DashboardEndpoints.adminPlan(id), planPayload(form))
    : api.post<unknown>(DashboardEndpoints.adminPlans, planPayload(form));
export const deletePlan = (id: string) =>
  api.delete<unknown>(DashboardEndpoints.adminPlan(id));

export const assignSubscription = (form: IAssignSubscriptionForm) =>
  api.post<unknown>(DashboardEndpoints.adminSubscriptions, {
    brand_id: form.brandId,
    plan_id: form.planId,
  });
export const updateSubscriptionStatus = (input: {
  id: string;
  status: string;
}) =>
  api.patch<unknown>(DashboardEndpoints.adminSubscriptionStatus(input.id), {
    status: input.status,
  });

export function gatewayPayload(form: IGatewayForm) {
  const config = parseConfigLines(form.config);
  return {
    code: form.code,
    name: { en: form.nameEn, ar: form.nameAr },
    driver: form.driver,
    is_active: form.isActive,
    is_default: form.isDefault,
    // Omitted when empty so the stored (encrypted) config is kept.
    ...(Object.keys(config).length > 0 ? { config } : {}),
  };
}

export const saveGateway = (form: IGatewayForm, id?: string) =>
  id
    ? api.put<unknown>(
        DashboardEndpoints.adminGateway(id),
        gatewayPayload(form),
      )
    : api.post<unknown>(DashboardEndpoints.adminGateways, gatewayPayload(form));
export const setGatewayActive = (input: { id: string; isActive: boolean }) =>
  api.patch<unknown>(DashboardEndpoints.adminGatewayActive(input.id), {
    is_active: input.isActive,
  });
export const deleteGateway = (id: string) =>
  api.delete<unknown>(DashboardEndpoints.adminGateway(id));

export function commissionRulePayload(form: ICommissionRuleForm) {
  return {
    scope: form.scope,
    scope_id: form.scope === "global" ? null : form.scopeId,
    type: form.type,
    value:
      form.type === "percent"
        ? percentToBasisPoints(form.value)
        : toMinorUnits(form.value),
    currency_id: form.type === "flat" ? form.currencyId : null,
    is_active: form.isActive,
  };
}

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
