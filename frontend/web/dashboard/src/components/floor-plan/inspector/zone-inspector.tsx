"use client";

import type { JSX } from "react";

import { InspectorNumberField } from "@/components/floor-plan/inspector/inspector-number-field";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { FloorPlanEditor } from "@/hooks/chairs/use-floor-plan-editor";
import type { FloorZoneRect } from "@/types/chairs/floor-plan.type";

/** Exact position and size of one half of a zoned plan, in percent of the canvas. */
export function ZoneInspector({ editor, zone }: { editor: FloorPlanEditor; zone: FloorZoneRect }): JSX.Element {
  const { dictionary } = useI18n();
  const { floorPlan: t } = dictionary;
  const set = (patch: Partial<FloorZoneRect>): void => editor.setZone(zone.zone, patch);

  return (
    <section aria-label={t.inspector.zone} className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <h3 className="font-medium">{t.zone[zone.zone]}</h3>
      <div className="grid grid-cols-2 gap-3">
        <InspectorNumberField id="zone-x" label={t.inspector.xPercent} value={zone.x} onChange={(value) => set({ x: value })} />
        <InspectorNumberField id="zone-y" label={t.inspector.yPercent} value={zone.y} onChange={(value) => set({ y: value })} />
        <InspectorNumberField id="zone-w" label={t.inspector.widthPercent} value={zone.width} onChange={(value) => set({ width: value })} />
        <InspectorNumberField id="zone-h" label={t.inspector.heightPercent} value={zone.height} onChange={(value) => set({ height: value })} />
      </div>
    </section>
  );
}
