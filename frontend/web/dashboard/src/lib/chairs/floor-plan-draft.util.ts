import { DEFAULT_DECORATION_SIZE, PERCENT_MAX, UNISEX_ZONES } from "@/config/floor-plan.constant";
import { FloorDecorationType } from "@/enums/floor-decoration-type.enum";
import { FloorPlanPreset } from "@/enums/floor-plan-preset.enum";
import type { FloorDecorationDraft, FloorPlanDraft } from "@/interfaces/chairs/floor-plan-draft.interface";
import { layoutOf } from "@/lib/chairs/chair-form.util";
import { clampChair, stageSize } from "@/lib/chairs/floor-plan-geometry.util";
import type { FloorPlanLayoutPayload } from "@/services/api/mutation/chairs/floor-plan.mutation";
import type { FloorPlan } from "@/types/chairs/floor-plan.type";

/** The editor's working copy of a saved plan. */
export function planToDraft(plan: FloorPlan): FloorPlanDraft {
  const { floor_plan: layout } = plan;
  const stage = stageSize(layout.canvas);
  return {
    preset: layout.preset ?? FloorPlanPreset.Standard,
    canvas: layout.canvas,
    decorations: layout.decorations.map((item, index) => ({ ...item, key: `saved-${index}` })),
    chairs: Object.fromEntries(plan.chairs.map((chair) => [chair.id, clampChair(layoutOf(chair), stage)])),
  };
}

export function isDirty(draft: FloorPlanDraft, saved: FloorPlanDraft): boolean {
  return JSON.stringify(draft) !== JSON.stringify(saved);
}

/** A new decoration lands in the middle of the canvas, ready to be dragged. */
export function newDecoration(type: FloorDecorationType, key: string): FloorDecorationDraft {
  const offset = (PERCENT_MAX - DEFAULT_DECORATION_SIZE) / 2;
  return { key, type, x: offset, y: offset, width: DEFAULT_DECORATION_SIZE, height: DEFAULT_DECORATION_SIZE, label: null };
}

/** The body of the floor-plan PATCH. A zoned preset gets its two halves; other presets send none. */
export function draftToLayoutPayload(draft: FloorPlanDraft): FloorPlanLayoutPayload {
  return {
    preset: draft.preset,
    zones: draft.preset === FloorPlanPreset.UnisexZoned ? UNISEX_ZONES.map((zone) => ({ ...zone })) : [],
    canvas: draft.canvas,
    decorations: draft.decorations.map((item) => ({ type: item.type, x: item.x, y: item.y, width: item.width, height: item.height, label: item.label ?? null })),
  };
}

/** Ids of the chairs whose placement differs from the saved plan. */
export function movedChairIds(draft: FloorPlanDraft, saved: FloorPlanDraft): string[] {
  return Object.keys(draft.chairs).filter((id) => JSON.stringify(draft.chairs[id]) !== JSON.stringify(saved.chairs[id]));
}
