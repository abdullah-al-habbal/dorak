"use client";

import type { JSX } from "react";

import { Switch } from "@/components/ui/switch";
import { useBrowserPush } from "@/hooks/account/notifications/use-browser-push";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

/** The "this browser" switch. It is hidden until the browser has been checked, and explains itself when push cannot work here. */
export function BrowserPushRow(): JSX.Element | null {
  const { account } = useDictionary();
  const t = account.notifications.browserPush;
  const { status, pending, enable, disable } = useBrowserPush();
  if (status === "checking" || status === "unconfigured") return null;

  const available = status === "on" || status === "off";
  const hint = status === "unsupported" ? t.unsupported : status === "denied" ? t.denied : t.hint;

  return (
    <div className="flex items-center justify-between gap-4 border-t pt-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{t.label}</span>
        <span id="browser-push-hint" aria-live="polite" className="text-sm text-muted-foreground">{hint}</span>
      </div>
      <Switch
        checked={status === "on"}
        disabled={!available || pending}
        aria-label={t.label}
        aria-describedby="browser-push-hint"
        onCheckedChange={(checked) => void (checked ? enable() : disable())}
      />
    </div>
  );
}
