"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { BRANCH_STATUS_STYLE } from "@/config/branch.constant";
import type { BranchStatus } from "@/enums/branch-status.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";

export function BranchStatusBadge({ status }: { status: BranchStatus }): JSX.Element {
  const { branches } = useDictionary();
  const { variant, icon: Icon } = BRANCH_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {branches.status[status]}
    </Badge>
  );
}
