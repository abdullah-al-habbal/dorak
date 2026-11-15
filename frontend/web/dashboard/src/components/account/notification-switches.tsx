"use client";

import type { JSX } from "react";

import { NotificationSwitchRow } from "@/components/account/notification-switch-row";
import { NOTIFICATION_PREFERENCE_KEYS } from "@/config/account.constant";
import { useNotificationToggle } from "@/hooks/use-notification-toggle";
import type { NotificationPreferences } from "@/types/account/notification-preferences.type";

export function NotificationSwitches({ preferences }: { preferences: NotificationPreferences }): JSX.Element {
  const { toggle, pending } = useNotificationToggle(preferences);
  return (
    <ul className="flex flex-col divide-y">
      {NOTIFICATION_PREFERENCE_KEYS.map((key) => (
        <NotificationSwitchRow key={key} preference={key} enabled={preferences[key]} disabled={pending} onToggle={toggle} />
      ))}
    </ul>
  );
}
