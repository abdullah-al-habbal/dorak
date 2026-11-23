"use client";

import type { JSX } from "react";

import { STYLIST_STATUS_STYLE } from "@/config/ops/stylist-status-badge.constant";
import type { BarberStatus } from "@/enums/people/barber-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function StylistStatusBadge({ status }: { status: BarberStatus }): JSX.Element {
  const { stylists } = useDictionary();
  return <StatusBadge status={status} styles={STYLIST_STATUS_STYLE} labels={stylists.status} scope="stylist" />;
}
