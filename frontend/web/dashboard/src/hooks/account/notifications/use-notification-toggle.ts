"use client";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useOptimisticToggleMutation } from "@/hooks/core/query/use-optimistic-toggle-mutation";
import { accountKeys } from "@/lib/query-keys/account/account-keys";
import { withNotificationPreference } from "@/lib/account/notification-preferences-cache.util";
import { updateNotificationPreferences } from "@/services/api/mutation/account/account.mutation";
import type { NotificationPreferenceKey } from "@/types/account/profile/notification-preference-key.type";
import type { NotificationPreferences } from "@/types/account/profile/notification-preferences.type";

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
  const toggle = (key: NotificationPreferenceKey, enabled: boolean): void => mutation.mutate({ current, key, enabled });

  return { toggle, pending: mutation.isPending };
}
