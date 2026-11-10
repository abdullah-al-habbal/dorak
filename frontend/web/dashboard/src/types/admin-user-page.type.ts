import type { AdminUser } from "@/types/admin-user.type";
import type { PageInfo } from "@/types/page-info.type";

export interface AdminUserPage {
  items: AdminUser[];
  page: PageInfo;
}
