import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { stylistSchema } from "@/schemas/stylist.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Stylist } from "@/types/stylists/stylist.type";

export function setStylistActive(id: string, active: boolean): Promise<Stylist> {
  const action = active ? "activate" : "deactivate";
  return apiRequest(`${DASHBOARD_API}/stylists/${encodeURIComponent(id)}/${action}`, { method: HttpMethod.Patch, schema: stylistSchema });
}
