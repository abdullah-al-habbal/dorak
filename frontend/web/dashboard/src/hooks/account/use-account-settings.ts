"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { accountKeys } from "@/lib/query-keys/account/account-keys";
import { fetchAccountSettings } from "@/services/api/query/account/account.query";
import type { AccountSettings } from "@/types/account/profile/account-settings.type";

export function useAccountSettings(): UseQueryResult<AccountSettings> {
  return useQuery({ queryKey: accountKeys.settings, queryFn: fetchAccountSettings });
}
