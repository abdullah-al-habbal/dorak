"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { platformSettingsKeys } from "@/lib/platform-settings-keys";
import { fetchPlatformSettings } from "@/services/api/query/platform-settings.query";
import type { PlatformSetting } from "@/types/platform-setting.type";

export function usePlatformSettings(): UseQueryResult<PlatformSetting[]> {
  return useQuery({ queryKey: platformSettingsKeys.all, queryFn: fetchPlatformSettings });
}
