"use client";

import type { JSX } from "react";

import { PAYOUT_STATUS_STYLE } from "@/config/money-shell/payout.constant";
import type { PayoutStatus } from "@/enums/money/payout-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function PayoutStatusBadge({ status }: { status: PayoutStatus }): JSX.Element {
  const { payouts } = useDictionary();
  return <StatusBadge status={status} styles={PAYOUT_STATUS_STYLE} labels={payouts.status} scope="payout" />;
}
