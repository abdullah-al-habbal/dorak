"use client";

import type { JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FloorPlanInspector } from "@/components/floor-plan/floor-plan-inspector";
import { FloorPlanStage } from "@/components/floor-plan/floor-plan-stage";
import { FloorPlanToolbar } from "@/components/floor-plan/floor-plan-toolbar";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { FLOOR_PLAN_EDIT_MIN_WIDTH_PX } from "@/config/floor-plan.constant";
import { useFloorPlan } from "@/hooks/chairs/use-floor-plan";
import { useFloorPlanEditor } from "@/hooks/chairs/use-floor-plan-editor";
import { useI18n } from "@/hooks/core/use-i18n";
import { useMediaQuery } from "@/hooks/core/use-media-query";
import { useSaveFloorPlan } from "@/hooks/chairs/use-save-floor-plan";
import type { FloorPlan } from "@/types/chairs/floor-plan.type";

interface FloorPlanPanelProps {
  branchId: string | null;
  /** The platform admin reads the plan; branch teams edit it. */
  viewOnly: boolean;
}

export function FloorPlanPanel({ branchId, viewOnly }: FloorPlanPanelProps): JSX.Element {
  const { dictionary } = useI18n();
  const { floorPlan: t } = dictionary;
  const query = useFloorPlan(branchId);

  if (branchId === null) return <EmptyState title={t.states.noBranchTitle} body={t.states.noBranchBody} />;
  if (query.isPending) return <TableSkeleton />;
  if (query.isError) return <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} />;
  // Remount after a refetch so the editor starts from what the server now holds.
  return <FloorPlanEditorView key={`${branchId}-${query.dataUpdatedAt}`} branchId={branchId} plan={query.data} viewOnly={viewOnly} />;
}

function FloorPlanEditorView({ branchId, plan, viewOnly }: { branchId: string; plan: FloorPlan; viewOnly: boolean }): JSX.Element {
  const { dictionary } = useI18n();
  const { floorPlan: t } = dictionary;
  const wide = useMediaQuery(`(min-width: ${FLOOR_PLAN_EDIT_MIN_WIDTH_PX}px)`);
  const readOnly = viewOnly || !wide;
  const editor = useFloorPlanEditor(plan);
  const save = useSaveFloorPlan();

  return (
    <div className="flex flex-col gap-4">
      {readOnly ? <p role="note" className="rounded-lg bg-muted px-3 py-2 text-sm">{viewOnly ? t.viewOnly : t.phoneNote}</p> : <p className="text-sm text-muted-foreground">{t.help}</p>}
      {readOnly ? null : <FloorPlanToolbar editor={editor} />}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem]">
        <FloorPlanStage editor={editor} chairs={plan.chairs} readOnly={readOnly} />
        {readOnly ? null : <FloorPlanInspector editor={editor} chairs={plan.chairs} />}
      </div>
      {readOnly ? null : (
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
          <p role="status" className="me-auto text-sm text-muted-foreground">{editor.dirty ? t.unsaved : ""}</p>
          <Button type="button" variant="ghost" disabled={!editor.dirty || save.isPending} onClick={editor.discard}>{t.discard}</Button>
          <LoadingButton
            type="button"
            loading={save.isPending}
            disabled={!editor.dirty}
            onClick={() => save.mutate({ branchId, plan, draft: editor.draft, saved: editor.saved })}
          >
            {t.save}
          </LoadingButton>
        </div>
      )}
    </div>
  );
}
