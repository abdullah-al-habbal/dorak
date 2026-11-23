"use client";

import type { JSX } from "react";

import { BRANCH_STATUS_STYLE } from "@/config/venue/branch.constant";
import type { BranchStatus } from "@/enums/venue/branch-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function BranchStatusBadge({ status }: { status: BranchStatus }): JSX.Element {
  const { branches } = useDictionary();
  return <StatusBadge status={status} styles={BRANCH_STATUS_STYLE} labels={branches.status} scope="branch" />;
}
