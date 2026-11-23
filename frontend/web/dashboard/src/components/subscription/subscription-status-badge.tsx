"use client";

import type { JSX } from "react";

import { SUBSCRIPTION_STATUS_STYLE } from "@/config/money-shell/subscription.constant";
import type { SubscriptionStatus } from "@/enums/money/subscription-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }): JSX.Element {
  const { subscription } = useDictionary();
  return <StatusBadge status={status} styles={SUBSCRIPTION_STATUS_STYLE} labels={subscription.status} scope="subscription" />;
}
