import { CLIENT_PER_PAGE } from "@/config/venue/client.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { clientQueryString } from "@/lib/clients/client-filters.util";
import { resolvePageInfo } from "@/lib/core/query/resolve-page-info.util";
import { adminClientListSchema } from "@/schemas/clients/admin-client.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { ClientFilters } from "@/types/clients/clients/client-filters.type";
import type { ClientPage } from "@/types/clients/clients/client-page.type";

export async function fetchClientPage(filters: ClientFilters): Promise<ClientPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/clients?${clientQueryString(filters, CLIENT_PER_PAGE)}`, { schema: adminClientListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, CLIENT_PER_PAGE, filters.page) };
}
