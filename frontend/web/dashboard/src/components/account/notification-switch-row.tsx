"use client";

import type { JSX } from "react";

import { Switch } from "@/components/ui/switch";
import { useDictionary } from "@/hooks/core/use-dictionary";
import type { NotificationPreferenceKey } from "@/types/account/notification-preference-key.type";

interface NotificationSwitchRowProps {
  preference: NotificationPreferenceKey;
  enabled: boolean;
  disabled: boolean;
  onToggle: (key: NotificationPreferenceKey, enabled: boolean) => void;
}

export function NotificationSwitchRow({ preference, enabled, disabled, onToggle }: NotificationSwitchRowProps): JSX.Element {
  const { account } = useDictionary();
  const t = account.notifications;
  const copy = t.keys[preference];
  const hintId = `notification-${preference}-hint`;

  return (
    <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{copy.label}</span>
        <span id={hintId} className="text-sm text-muted-foreground">{copy.hint}</span>
      </div>
      <Switch
        checked={enabled}
        disabled={disabled}
        aria-label={t.toggleLabel.replace("{setting}", copy.label)}
        aria-describedby={hintId}
        onCheckedChange={(checked) => onToggle(preference, checked)}
      />
    </li>
  );
}
