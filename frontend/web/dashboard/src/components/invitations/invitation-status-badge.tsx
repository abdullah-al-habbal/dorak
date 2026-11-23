"use client";

import type { JSX } from "react";

import { StatusBadge } from "@/components/common/status-badge";
import { AFFILIATION_STATUS_STYLE } from "@/config/ops/invitation.constant";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function InvitationStatusBadge({ status }: { status: string }): JSX.Element {
  const { invitations } = useDictionary();
  return <StatusBadge status={status} styles={AFFILIATION_STATUS_STYLE} labels={invitations.status} scope="invitation" />;
}
