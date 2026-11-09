"use client";

import { useCallback } from "react";

import { useDictionary } from "@/hooks/use-dictionary";
import { useOptimisticToggleMutation } from "@/hooks/use-optimistic-toggle-mutation";
import { accountKeys } from "@/lib/account-keys";
import { withNotificationPreference } from "@/lib/notification-preferences-cache.util";
import { updateNotificationPreferences } from "@/services/api/mutation/account.mutation";
import type { NotificationPreferenceKey } from "@/types/notification-preference-key.type";
import type { NotificationPreferences } from "@/types/notification-preferences.type";

interface ToggleVariables {
  current: NotificationPreferences;
  key: NotificationPreferenceKey;
  enabled: boolean;
}

interface NotificationToggle {
  toggle: (key: NotificationPreferenceKey, enabled: boolean) => void;
  pending: boolean;
}

/** Flips one switch at once and rolls it back if the save fails. The backend takes all four values, so each save sends them all. */
export function useNotificationToggle(current: NotificationPreferences): NotificationToggle {
  const { account } = useDictionary();
  const t = account.notifications;
  const mutation = useOptimisticToggleMutation<NotificationPreferences, ToggleVariables, NotificationPreferences>({
    queryKey: accountKeys.notifications,
    mutationFn: ({ current: values, key, enabled }) => updateNotificationPreferences({ ...values, [key]: enabled }),
    patch: (cached, { key, enabled }) => withNotificationPreference(cached, key, enabled),
    successMessage: ({ key, enabled }) => (enabled ? t.turnedOn : t.turnedOff).replace("{setting}", t.keys[key].label),
    failureMessage: t.failed,
  });
  const { mutate } = mutation;

  const toggle = useCallback((key: NotificationPreferenceKey, enabled: boolean) => mutate({ current, key, enabled }), [current, mutate]);

  return { toggle, pending: mutation.isPending };
}
