"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { platformSettingsKeys } from "@/lib/platform-settings-keys";
import { savePlatformSettings } from "@/services/api/mutation/save-platform-settings.mutation";

export function useSavePlatformSettings(): UseMutationResult<Record<string, number>, Error, Record<string, number>> {
  const { settings } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: savePlatformSettings,
    onSuccess: () => toast.success(settings.toast.saved),
    onSettled: () => client.invalidateQueries({ queryKey: platformSettingsKeys.all }),
  });
}
