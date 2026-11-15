"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { platformSettingsKeys } from "@/lib/query-keys/platform/platform-settings-keys";
import { savePlatformSettings } from "@/services/api/mutation/save-platform-settings.mutation";

export function useSavePlatformSettings(): UseMutationResult<Record<string, number>, Error, Record<string, number>> {
  const { settings } = useDictionary();
  return useFeedbackMutation({
    mutationFn: savePlatformSettings,
    invalidate: [platformSettingsKeys.all],
    successMessage: () => settings.toast.saved,
  });
}
