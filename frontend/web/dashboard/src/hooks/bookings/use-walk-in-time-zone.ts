"use client";

import { useBranchOptions } from "@/hooks/branches/use-branch-options";
import type { ChairOption } from "@/types/chairs/chair-option.type";

/** The zone of the chosen chair's branch; before a chair is chosen, of the first branch the account can see. */
export function useWalkInTimeZone(chairs: readonly ChairOption[] | undefined, chairId: string): string | undefined {
  const branches = useBranchOptions(true).data ?? [];
  const branchId = chairs?.find((chair) => chair.id === chairId)?.branch_id;
  return (branches.find((branch) => branch.id === branchId) ?? branches[0])?.timezone;
}
