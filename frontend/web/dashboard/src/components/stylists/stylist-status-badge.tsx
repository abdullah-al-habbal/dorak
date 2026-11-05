"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { STYLIST_STATUS_STYLE } from "@/config/stylist-status-badge.constant";
import type { BarberStatus } from "@/enums/barber-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";

export function StylistStatusBadge({ status }: { status: BarberStatus }): JSX.Element {
  const { stylists } = useDictionary();
  const { variant, icon: Icon } = STYLIST_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {stylists.status[status]}
    </Badge>
  );
}
