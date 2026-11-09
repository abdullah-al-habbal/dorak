"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { accountKeys } from "@/lib/account-keys";
import { fetchAccountProfile } from "@/services/api/query/account.query";
import type { AccountProfile } from "@/types/account-profile.type";

export function useAccountProfile(): UseQueryResult<AccountProfile> {
  return useQuery({ queryKey: accountKeys.profile, queryFn: fetchAccountProfile });
}
