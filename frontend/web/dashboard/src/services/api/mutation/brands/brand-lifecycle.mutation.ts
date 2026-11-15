import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { BrandLifecyclePayload } from "@/interfaces/brands/brand-lifecycle-payload.interface";
import type { BrandUpdatePayload } from "@/interfaces/brands/brand-update-payload.interface";
import { adminBrandSchema } from "@/schemas/brands/admin-brand.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

function brandPath(id: string): string {
  return encodeURIComponent(id);
}

/** Reject and suspend carry a reason; reactivate carries none. Admin only. */
export function transitionBrand({ id, action, reason, cancelFutureBookings }: BrandLifecyclePayload): Promise<AdminBrand> {
  const body = cancelFutureBookings === undefined ? { reason } : { reason, cancel_future_bookings: cancelFutureBookings };
  return apiRequest(`${DASHBOARD_API}/admin/brands/${brandPath(id)}/${action}`, { method: HttpMethod.Patch, body, schema: adminBrandSchema });
}

/** The owner sends a fixed, rejected brand for review again. */
export function resubmitBrand(id: string): Promise<AdminBrand> {
  return apiRequest(`${DASHBOARD_API}/brands/${brandPath(id)}/resubmit`, { method: HttpMethod.Post, schema: adminBrandSchema });
}

export function updateBrand(id: string, payload: BrandUpdatePayload): Promise<AdminBrand> {
  return apiRequest(`${DASHBOARD_API}/brands/${brandPath(id)}`, { method: HttpMethod.Put, body: payload, schema: adminBrandSchema });
}

export function updateBrandFeatures(id: string, flags: Record<string, boolean>): Promise<Record<string, boolean>> {
  return apiRequest(`${DASHBOARD_API}/admin/brands/${brandPath(id)}/features`, { method: HttpMethod.Patch, body: flags, schema: z.record(z.string(), z.boolean()) });
}
