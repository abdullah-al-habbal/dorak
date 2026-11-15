import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import type { BrandCreatePayload } from "@/interfaces/brands/brand-create-payload.interface";
import { adminBrandSchema } from "@/schemas/brands/admin-brand.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

/** An existing owner adds another brand; it starts pending and goes to the platform team's approval. */
export function createBrand(payload: BrandCreatePayload): Promise<AdminBrand> {
  return apiRequest(`${DASHBOARD_API}/brands`, { method: HttpMethod.Post, body: payload, schema: adminBrandSchema });
}
