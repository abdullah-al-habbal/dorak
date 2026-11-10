"use client";

import { BanIcon } from "lucide-react";
import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { BARBER_APPROVAL_STATUS_STYLE } from "@/config/barber-approval.constant";
import type { BarberStatus } from "@/enums/barber-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";

/** A ban outranks the account status, so a banned barber shows the ban badge only. */
export function BarberStatusBadge({ status, banned = false }: { status: BarberStatus; banned?: boolean }): JSX.Element {
  const { barberApprovals, clients } = useDictionary();
  if (banned) {
    return (
      <Badge variant="destructive">
        <BanIcon aria-hidden />
        {clients.banned}
      </Badge>
    );
  }
  const { variant, icon: Icon } = BARBER_APPROVAL_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {barberApprovals.status[status]}
    </Badge>
  );
}
