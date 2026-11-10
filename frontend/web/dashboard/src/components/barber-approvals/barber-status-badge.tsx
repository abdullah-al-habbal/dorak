"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { BARBER_APPROVAL_STATUS_STYLE } from "@/config/barber-approval.constant";
import type { BarberStatus } from "@/enums/barber-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";

export function BarberStatusBadge({ status }: { status: BarberStatus }): JSX.Element {
  const { barberApprovals } = useDictionary();
  const { variant, icon: Icon } = BARBER_APPROVAL_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {barberApprovals.status[status]}
    </Badge>
  );
}
