import { ADMIN_USER_PER_PAGE } from "@/config/admin-user.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { adminUserQueryString } from "@/lib/admin-user-filters.util";
import { resolvePageInfo } from "@/lib/resolve-page-info.util";
import { adminUserListSchema } from "@/schemas/admin-user.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { AdminUserFilters } from "@/types/platform/admin-user-filters.type";
import type { AdminUserPage } from "@/types/platform/admin-user-page.type";

export async function fetchAdminUserPage(filters: AdminUserFilters): Promise<AdminUserPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/admins?${adminUserQueryString(filters, ADMIN_USER_PER_PAGE)}`, { schema: adminUserListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, ADMIN_USER_PER_PAGE, filters.page) };
}
