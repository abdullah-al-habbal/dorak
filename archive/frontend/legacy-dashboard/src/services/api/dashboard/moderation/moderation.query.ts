import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import {
  mapDisputedReview,
  mapExchangeRate,
} from "@/services/api/dashboard/moderation/moderation.mapper.util";
import type { IActivationReasonForm } from "@/services/api/dashboard/moderation/types/iactivation-reason-form.types";
import type { IDisputedReview } from "@/services/api/dashboard/moderation/types/idisputed-review.types";
import type { IExchangeRate } from "@/services/api/dashboard/moderation/types/iexchange-rate.types";
import type { IResolveDisputeForm } from "@/services/api/dashboard/moderation/types/iresolve-dispute-form.types";
import type { IDashboardPage } from "@/services/api/dashboard/shared/types/idashboard-page.types";

export const disputedReviewsQueryKey = (page: number) =>
  ["dashboard", "reviews", "disputed", page] as const;
export const exchangeRatesQueryKey = ["dashboard", "exchange-rates"] as const;

export async function getDisputedReviews(
  page: number,
): Promise<IDashboardPage<IDisputedReview>> {
  const result = await api.get<IDashboardPage<unknown>>(
    `${DashboardEndpoints.adminReviews}?status=disputed&page=${page}`,
  );
  return { ...result, items: result.items.map(mapDisputedReview) };
}

export function resolveDispute(reviewId: string, form: IResolveDisputeForm) {
  return api.patch<unknown>(DashboardEndpoints.adminReviewResolve(reviewId), {
    status: form.status,
    ...(form.note.trim() === "" ? {} : { note: form.note.trim() }),
  });
}

export async function getExchangeRates(): Promise<IExchangeRate[]> {
  const result = await api.get<unknown[]>(
    DashboardEndpoints.adminExchangeRates,
  );
  return result.map(mapExchangeRate);
}

/** Body for stylist activate/deactivate: the reason is optional on the API. */
export function activationBody(form: IActivationReasonForm) {
  const reason = form.reason.trim();
  return reason === "" ? undefined : { reason };
}
