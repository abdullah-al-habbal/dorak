import type { AdminUserState } from "@/enums/access/admin-user-state.enum";

export interface AdminUserFilters {
  state: AdminUserState;
  search?: string;
  page: number;
}
