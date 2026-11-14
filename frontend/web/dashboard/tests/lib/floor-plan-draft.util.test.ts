import { describe, expect, it } from "vitest";

import { DEFAULT_DECORATION_SIZE, UNISEX_ZONES } from "@/config/floor-plan.constant";
import { ChairStatus } from "@/enums/chair-status.enum";
import { FloorCanvasUnit } from "@/enums/floor-canvas-unit.enum";
import { FloorDecorationType } from "@/enums/floor-decoration-type.enum";
import { FloorPlanPreset } from "@/enums/floor-plan-preset.enum";
import { FloorZone } from "@/enums/floor-zone.enum";
import { chairPayloadWithLayout } from "@/lib/floor-plan-save.util";
import { draftToLayoutPayload, isDirty, movedChairIds, newDecoration, planToDraft } from "@/lib/floor-plan-draft.util";
import type { Chair } from "@/types/chair.type";
import type { FloorPlan } from "@/types/floor-plan.type";

const chair: Chair = {
  id: "c1",
  label: "Chair 1",
  status: ChairStatus.Available,
  configured_status: ChairStatus.Available,
  floor_zone: FloorZone.Shared,
  branch_id: "b1",
  layout_settings: { position_x: 5000, position_y: 10, width: 60, height: 60, rotation: null },
};

const plan: FloorPlan = {
  branch_id: "b1",
  chairs: [chair, { ...chair, id: "c2", layout_settings: { position_x: 10, position_y: 10, width: 60, height: 60, rotation: 0 } }],
  floor_plan: {
    preset: null,
    zones: [],
    canvas: { width: 20, height: 10, unit: FloorCanvasUnit.Meters },
    decorations: [{ type: FloorDecorationType.Plant, x: 1, y: 2, width: 3, height: 4, label: null }],
  },
};

describe("floor plan draft", () => {
  it("builds the working copy: standard preset by default, keyed decorations, clamped chairs", () => {
    const draft = planToDraft(plan);
    expect(draft.preset).toBe(FloorPlanPreset.Standard);
    expect(draft.decorations[0]).toMatchObject({ key: "saved-0", type: FloorDecorationType.Plant });
    expect(draft.chairs.c1.position_x).toBe(940);
    expect(draft.chairs.c2.position_x).toBe(10);
  });

  it("detects changes against the saved copy", () => {
    const saved = planToDraft(plan);
    expect(isDirty(planToDraft(plan), saved)).toBe(false);
    expect(isDirty({ ...saved, preset: FloorPlanPreset.Compact }, saved)).toBe(true);
  });

  it("lists only the chairs that moved", () => {
    const saved = planToDraft(plan);
    const draft = { ...saved, chairs: { ...saved.chairs, c2: { ...saved.chairs.c2, position_x: 99 } } };
    expect(movedChairIds(draft, saved)).toEqual(["c2"]);
    expect(movedChairIds(saved, saved)).toEqual([]);
  });

  it("drops a new decoration in the middle of the canvas", () => {
    const item = newDecoration(FloorDecorationType.Mirror, "k1");
    const offset = (100 - DEFAULT_DECORATION_SIZE) / 2;
    expect(item).toEqual({ key: "k1", type: FloorDecorationType.Mirror, x: offset, y: offset, width: DEFAULT_DECORATION_SIZE, height: DEFAULT_DECORATION_SIZE, label: null });
  });

  it("sends zones only for the unisex zoned preset and strips local keys", () => {
    const draft = planToDraft(plan);
    const standard = draftToLayoutPayload(draft);
    expect(standard.zones).toEqual([]);
    expect(standard.decorations[0]).not.toHaveProperty("key");
    const zoned = draftToLayoutPayload({ ...draft, preset: FloorPlanPreset.UnisexZoned });
    expect(zoned.zones).toEqual(UNISEX_ZONES.map((zone) => ({ ...zone })));
    expect(zoned.preset).toBe(FloorPlanPreset.UnisexZoned);
  });

  it("builds the full chair body for a placement change and changes nothing else", () => {
    const layout = { position_x: 1, position_y: 2, width: 3, height: 4, rotation: 5 };
    const payload = chairPayloadWithLayout(chair, "b1", layout);
    expect(payload.layout_settings).toEqual(layout);
    expect(payload).toMatchObject({ branch_id: "b1", label: "Chair 1", floor_zone: FloorZone.Shared, status: ChairStatus.Available });
  });
});
