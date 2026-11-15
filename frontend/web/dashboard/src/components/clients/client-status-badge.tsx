"use client";

import { BanIcon } from "lucide-react";
import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { CLIENT_STATUS_STYLE } from "@/config/venue/client.constant";
import type { ClientStatus } from "@/enums/people/client-status.enum";
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
  const { variant, icon: Icon } = CLIENT_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {clients.status[status]}
    </Badge>
  );
}
