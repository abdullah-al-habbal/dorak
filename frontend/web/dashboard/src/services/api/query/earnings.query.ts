import { DASHBOARD_API } from "@/config/routes.constant";
import { earningsSchema } from "@/schemas/earnings/earnings.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Earnings } from "@/types/earnings/earnings.type";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";

export async function fetchEarnings(range: EarningsRange): Promise<Earnings> {
  const params = new URLSearchParams({ from: range.from, to: range.to });
  return apiRequest(`${DASHBOARD_API}/earnings?${params.toString()}`, { schema: earningsSchema });
}
