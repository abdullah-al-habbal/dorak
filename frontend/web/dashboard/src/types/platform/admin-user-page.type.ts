import type { AdminUser } from "@/types/platform/admin-user.type";
import type { PageInfo } from "@/types/core/page-info.type";

export interface AdminUserPage {
  items: AdminUser[];
  page: PageInfo;
}
