"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { PAYOUT_STATUS_STYLE } from "@/config/money-shell/payout.constant";
import type { PayoutStatus } from "@/enums/money/payout-status.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function PayoutStatusBadge({ status }: { status: PayoutStatus }): JSX.Element {
  const { payouts } = useDictionary();
  const { variant, icon: Icon } = PAYOUT_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {payouts.status[status]}
    </Badge>
  );
}
