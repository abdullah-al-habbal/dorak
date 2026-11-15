"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_STATUS_STYLE } from "@/config/money-shell/subscription.constant";
import type { SubscriptionStatus } from "@/enums/money/subscription-status.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }): JSX.Element {
  const { subscription } = useDictionary();
  const { variant, icon: Icon } = SUBSCRIPTION_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {subscription.status[status]}
    </Badge>
  );
}
