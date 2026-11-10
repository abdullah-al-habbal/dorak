"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { adminUserKeys } from "@/lib/admin-user-keys";
import { fetchAdminUserPage } from "@/services/api/query/admin-user-page.query";
import type { AdminUserFilters } from "@/types/admin-user-filters.type";
import type { AdminUserPage } from "@/types/admin-user-page.type";

export function useAdminUsers(filters: AdminUserFilters): UseQueryResult<AdminUserPage> {
  return useListQuery(adminUserKeys.list(filters), () => fetchAdminUserPage(filters));
}
