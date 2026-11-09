"use client";

import type { JSX } from "react";

import { AccountSection } from "@/components/account/account-section";
import { NotificationSwitches } from "@/components/account/notification-switches";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useDictionary } from "@/hooks/use-dictionary";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";

export function NotificationsSection(): JSX.Element {
  const { account } = useDictionary();
  const t = account.notifications;
  const query = useNotificationPreferences();

  return (
    <AccountSection id="notifications" title={t.title} description={t.description}>
      {query.isPending ? <Skeleton role="status" aria-label={account.states.loading} className="h-40 w-full" /> : null}
      {query.isError && !query.data ? <ErrorState title={account.states.errorTitle} body={account.states.errorBody} onRetry={() => query.refetch()} /> : null}
      {query.data ? <NotificationSwitches preferences={query.data} /> : null}
    </AccountSection>
  );
}
