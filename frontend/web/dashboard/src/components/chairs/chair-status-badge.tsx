"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { CHAIR_STATUS_STYLE } from "@/config/venue/chair-status-badge.constant";
import type { ChairStatus } from "@/enums/venue/chair-status.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function ChairStatusBadge({ status }: { status: ChairStatus }): JSX.Element {
  const { chairs } = useDictionary();
  const { variant, icon: Icon } = CHAIR_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {chairs.status[status]}
    </Badge>
  );
}
