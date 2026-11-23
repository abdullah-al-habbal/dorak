"use client";

import type { JSX } from "react";

import { CHAIR_STATUS_STYLE } from "@/config/venue/chair-status-badge.constant";
import type { ChairStatus } from "@/enums/venue/chair-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function ChairStatusBadge({ status }: { status: ChairStatus }): JSX.Element {
  const { chairs } = useDictionary();
  return <StatusBadge status={status} styles={CHAIR_STATUS_STYLE} labels={chairs.status} scope="chair" />;
}
