"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import type { FloorPlanDraft } from "@/interfaces/chairs/floor-plan-draft.interface";
import { chairKeys } from "@/lib/query-keys/chairs/chair-keys";
import { draftToLayoutPayload, movedChairIds } from "@/lib/chairs/floor-plan-draft.util";
import { floorPlanKeys } from "@/lib/query-keys/chairs/floor-plan-keys";
import { chairPayloadWithLayout } from "@/lib/chairs/floor-plan-save.util";
import { saveFloorPlanLayout } from "@/services/api/mutation/floor-plan.mutation";
import { updateChair } from "@/services/api/mutation/save-chair.mutation";
import type { FloorPlan } from "@/types/chairs/floor-plan.type";

interface SaveFloorPlanVariables {
  branchId: string;
  plan: FloorPlan;
  draft: FloorPlanDraft;
  saved: FloorPlanDraft;
}

/** Saves the layout first, then each chair that moved. Chairs are separate records, so a failure part-way leaves earlier ones saved; the refresh shows what stuck. */
export function useSaveFloorPlan(): UseMutationResult<void, Error, SaveFloorPlanVariables> {
  const { floorPlan } = useDictionary();
  return useFeedbackMutation({
    mutationFn: async ({ branchId, plan, draft, saved }: SaveFloorPlanVariables) => {
      await saveFloorPlanLayout(branchId, draftToLayoutPayload(draft));
      for (const id of movedChairIds(draft, saved)) {
        const chair = plan.chairs.find((candidate) => candidate.id === id);
        if (chair) await updateChair(id, chairPayloadWithLayout(chair, branchId, draft.chairs[id]));
      }
    },
    invalidate: [floorPlanKeys.all, chairKeys.all],
    successMessage: () => floorPlan.toast.saved,
    errorMessage: () => floorPlan.toast.failed,
  });
}
