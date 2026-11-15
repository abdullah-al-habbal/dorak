"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/use-list-query";
import { adminUserKeys } from "@/lib/query-keys/platform/admin-user-keys";
import { fetchAdminUserPage } from "@/services/api/query/platform/admin-user-page.query";
import type { AdminUserFilters } from "@/types/platform/admin-user-filters.type";
import type { AdminUserPage } from "@/types/platform/admin-user-page.type";

export function useAdminUsers(filters: AdminUserFilters): UseQueryResult<AdminUserPage> {
  return useListQuery(adminUserKeys.list(filters), () => fetchAdminUserPage(filters));
}
