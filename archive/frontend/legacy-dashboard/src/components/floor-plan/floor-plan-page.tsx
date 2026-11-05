"use client";

import { BranchPicker } from "@/components/branches/branch-picker";
import { FloorPlanEditor } from "@/components/floor-plan/floor-plan-editor";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSelectedBranch } from "@/hooks/use-selected-branch";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import {
  floorPlanQueryKey,
  getBranchFloorPlan,
} from "@/services/api/dashboard/floor-plan/floor-plan.query";
import { useQuery } from "@tanstack/react-query";

export function FloorPlanPage() {
  const dictionary = useDictionary();
  const copy = dictionary.floorPlan;
  const { branches, branchId, selectBranch, isLoading } =
    useSelectedBranch("floor-plan");
  const floorPlan = useQuery({
    enabled: branchId !== undefined,
    queryKey: floorPlanQueryKey(branchId ?? ""),
    queryFn: () => getBranchFloorPlan(branchId ?? ""),
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">{copy.title}</h1>
      {!isLoading && branches.length === 0 ? (
        <p className="text-text-secondary">{copy.noBranches}</p>
      ) : (
        <BranchPicker
          label={copy.branch}
          branches={branches}
          value={branchId}
          onChange={selectBranch}
        />
      )}
      {floorPlan.isPending && branchId !== undefined ? (
        <p className="text-text-secondary">{copy.loading}</p>
      ) : null}
      {floorPlan.isError ? (
        <p role="alert">{apiErrorMessage(floorPlan.error, dictionary)}</p>
      ) : null}
      {floorPlan.data ? (
        <FloorPlanEditor
          key={floorPlan.data.branchId}
          floorPlan={floorPlan.data}
        />
      ) : null}
    </section>
  );
}
