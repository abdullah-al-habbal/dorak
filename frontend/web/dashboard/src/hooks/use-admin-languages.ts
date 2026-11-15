"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { languageAdminKeys } from "@/lib/query-keys/platform/language-admin-keys";
import { fetchAdminLanguages } from "@/services/api/query/language-admin.query";
import type { AdminLanguage } from "@/types/platform/admin-language.type";

export function useAdminLanguages(): UseQueryResult<AdminLanguage[]> {
  return useListQuery(languageAdminKeys.list, fetchAdminLanguages);
}
