import { BARBER_APPROVAL_PER_PAGE } from "@/config/barber-approval.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { barberApprovalQueryString } from "@/lib/barber-approval-filters.util";
import { resolvePageInfo } from "@/lib/resolve-page-info.util";
import { barberApprovalListSchema } from "@/schemas/barber-approval.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { BarberApprovalFilters } from "@/types/stylists/barber-approval-filters.type";
import type { BarberApprovalPage } from "@/types/stylists/barber-approval-page.type";

export async function fetchBarberApprovalPage(filters: BarberApprovalFilters, perPage: number = BARBER_APPROVAL_PER_PAGE): Promise<BarberApprovalPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/barbers?${barberApprovalQueryString(filters, perPage)}`, { schema: barberApprovalListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, perPage, filters.page) };
}
