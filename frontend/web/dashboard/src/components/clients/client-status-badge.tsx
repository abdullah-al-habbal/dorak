"use client";

import { BanIcon } from "lucide-react";
import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { CLIENT_STATUS_STYLE } from "@/config/venue/client.constant";
import type { ClientStatus } from "@/enums/people/client-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

interface ClientStatusBadgeProps {
  status: ClientStatus;
  banned: boolean;
}

/** A ban outranks the account status, so a banned client shows the ban badge only. */
export function ClientStatusBadge({ status, banned }: ClientStatusBadgeProps): JSX.Element {
  const { clients } = useDictionary();
  if (banned) {
    return (
      <Badge variant="destructive">
        <BanIcon aria-hidden />
        {clients.banned}
      </Badge>
    );
  }
  return <StatusBadge status={status} styles={CLIENT_STATUS_STYLE} labels={clients.status} scope="client" />;
}
