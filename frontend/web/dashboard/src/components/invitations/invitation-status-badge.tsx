"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { AFFILIATION_STATUS_STYLE } from "@/config/ops/invitation.constant";
import { AffiliationStatus } from "@/enums/people/affiliation-status.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

function asStatus(value: string): AffiliationStatus {
  return Object.values(AffiliationStatus).find((status) => status === value) ?? AffiliationStatus.Pending;
}

export function InvitationStatusBadge({ status }: { status: string }): JSX.Element {
  const { invitations } = useDictionary();
  const known = asStatus(status);
  const { variant, icon: Icon } = AFFILIATION_STATUS_STYLE[known];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {invitations.status[known]}
    </Badge>
  );
}
