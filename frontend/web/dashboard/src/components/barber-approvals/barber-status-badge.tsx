"use client";

import { BanIcon } from "lucide-react";
import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { BARBER_APPROVAL_STATUS_STYLE } from "@/config/ops/barber-approval.constant";
import type { BarberStatus } from "@/enums/people/barber-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

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
  return <StatusBadge status={status} styles={BARBER_APPROVAL_STATUS_STYLE} labels={barberApprovals.status} scope="barber" />;
}
