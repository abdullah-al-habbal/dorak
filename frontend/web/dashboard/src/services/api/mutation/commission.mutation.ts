import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { CommissionScope, CommissionType } from "@/enums/commission.enum";
import { HttpMethod } from "@/enums/http-method.enum";
import { commissionRuleSchema } from "@/schemas/commission.zod";
import { apiRequest } from "@/services/api/core/client";
import type { CommissionRule } from "@/types/earnings/commission.type";

export interface CommissionRulePayload {
  scope: CommissionScope;
  scope_id: string | null;
  type: CommissionType;
  /** Percent rules only. */
  value_bps?: number;
  /** Flat rules only. */
  value_amount_minor?: number;
  currency_code?: string;
  is_active: boolean;
  notes: string | null;
}

const RULES = `${DASHBOARD_API}/admin/commission-rules`;

export function createCommissionRule(payload: CommissionRulePayload): Promise<CommissionRule> {
  return apiRequest(RULES, { method: HttpMethod.Post, body: payload, schema: commissionRuleSchema });
}

export function updateCommissionRule(id: string, payload: CommissionRulePayload): Promise<CommissionRule> {
  return apiRequest(`${RULES}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: commissionRuleSchema });
}

export async function deleteCommissionRule(id: string): Promise<void> {
  await apiRequest(`${RULES}/${encodeURIComponent(id)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}
