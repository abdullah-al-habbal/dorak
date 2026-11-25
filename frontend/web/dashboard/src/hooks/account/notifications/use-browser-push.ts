"use client";

import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/hooks/core/state/use-auth-store";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { detectBrowserPushStatus, pushOwnerKey, turnOffBrowserPush, turnOnBrowserPush } from "@/lib/push/browser-push-flow.util";
import { parseWebPushConfig, readWebPushEnv } from "@/lib/push/web-push-config.util";
import type { BrowserPushStatus } from "@/types/push/browser-push-status.type";

interface BrowserPush {
  status: BrowserPushStatus;
  pending: boolean;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
}

/** Build-time values: fixed for the life of the page, so read once. */
const WEB_PUSH_CONFIG = parseWebPushConfig(readWebPushEnv());

function subscribeNever(): () => void {
  return () => undefined;
}

/** Browser push for this account: asks for permission only when the person turns it on, and degrades to a note when it cannot work. */
export function useBrowserPush(): BrowserPush {
  const { account } = useDictionary();
  const { locale } = useI18n();
  const profile = useAuthStore((state) => state.profile);
  const owner = profile ? pushOwnerKey(profile) : null;
  // The browser is read through a store snapshot (the server render says "checking"); a change made here overrides it.
  const detected = useSyncExternalStore(subscribeNever, () => detectBrowserPushStatus(WEB_PUSH_CONFIG !== null, owner), () => "checking" as const);
  const [override, setOverride] = useState<BrowserPushStatus | null>(null);
  const [pending, setPending] = useState(false);

  const run = async (change: () => Promise<BrowserPushStatus>): Promise<void> => {
    setPending(true);
    try {
      setOverride(await change());
    } catch {
      toast.error(account.notifications.browserPush.failed);
      setOverride(detectBrowserPushStatus(true, owner));
    } finally {
      setPending(false);
    }
  };

  const enable = async (): Promise<void> => {
    if (WEB_PUSH_CONFIG && owner) await run(() => turnOnBrowserPush({ config: WEB_PUSH_CONFIG, locale, owner }));
  };
  const disable = async (): Promise<void> => {
    if (WEB_PUSH_CONFIG) await run(() => turnOffBrowserPush(WEB_PUSH_CONFIG));
  };

  return { status: override ?? detected, pending, enable, disable };
}
