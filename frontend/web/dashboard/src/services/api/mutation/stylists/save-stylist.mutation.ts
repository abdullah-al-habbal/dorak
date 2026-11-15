import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { StylistPayload } from "@/interfaces/stylists/stylist-payload.interface";
import { stylistSchema } from "@/schemas/stylists/stylist.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Stylist } from "@/types/stylists/stylist.type";

const STYLISTS = `${DASHBOARD_API}/stylists`;

export function createStylist(payload: StylistPayload): Promise<Stylist> {
  return apiRequest(STYLISTS, { method: HttpMethod.Post, body: payload, schema: stylistSchema });
}

export function updateStylist(id: string, payload: StylistPayload): Promise<Stylist> {
  return apiRequest(`${STYLISTS}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: stylistSchema });
}
