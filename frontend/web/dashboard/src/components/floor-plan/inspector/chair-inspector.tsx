"use client";

import { RotateCcwIcon, RotateCwIcon } from "lucide-react";
import type { JSX } from "react";

import { FormField } from "@/components/common/form-field";
import { InspectorNumberField } from "@/components/floor-plan/inspector/inspector-number-field";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { ROTATION_STEP } from "@/config/venue/floor-plan.constant";
import { FloorZone } from "@/enums/people/floor-zone.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { FloorPlanEditor } from "@/hooks/chairs/use-floor-plan-editor";
import { parseEnumValue } from "@/lib/core/parse/enum-value.util";
import { rotateChair } from "@/lib/chairs/floor-plan-geometry.util";
import type { Chair } from "@/types/chairs/chair.type";

/** Exact placement, rotation and zone of the selected chair. */
export function ChairInspector({ editor, chair }: { editor: FloorPlanEditor; chair: Chair }): JSX.Element | null {
  const { dictionary } = useI18n();
  const { floorPlan: t } = dictionary;
  const layout = editor.draft.chairs[chair.id];
  if (!layout) return null;
  const set = (patch: Partial<typeof layout>): void => editor.setChair(chair.id, { ...layout, ...patch });

  return (
    <section aria-label={t.inspector.chair} className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <h3 dir="auto" className="font-medium">{chair.label || t.chair}</h3>
      <div className="grid grid-cols-2 gap-3">
        <InspectorNumberField id="chair-x" label={t.inspector.x} value={layout.position_x} onChange={(value) => set({ position_x: value })} />
        <InspectorNumberField id="chair-y" label={t.inspector.y} value={layout.position_y} onChange={(value) => set({ position_y: value })} />
        <InspectorNumberField id="chair-w" label={t.inspector.width} value={layout.width} onChange={(value) => set({ width: value })} />
        <InspectorNumberField id="chair-h" label={t.inspector.height} value={layout.height} onChange={(value) => set({ height: value })} />
        <InspectorNumberField id="chair-r" label={t.inspector.rotation} value={layout.rotation ?? 0} onChange={(value) => set({ rotation: value })} />
      </div>
      <FormField id="chair-zone" label={t.inspector.chairZone}>
        <NativeSelect id="chair-zone" value={editor.draft.chairZones[chair.id] ?? FloorZone.Shared} onChange={(event) => editor.setChairZone(chair.id, parseEnumValue(FloorZone, event.target.value) ?? FloorZone.Shared)}>
          {Object.values(FloorZone).map((value) => (
            <option key={value} value={value}>{t.zone[value]}</option>
          ))}
        </NativeSelect>
      </FormField>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => editor.setChair(chair.id, rotateChair(layout, -ROTATION_STEP))}>
          <RotateCcwIcon aria-hidden data-icon="inline-start" />
          {t.inspector.rotateLeft}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor.setChair(chair.id, rotateChair(layout, ROTATION_STEP))}>
          <RotateCwIcon aria-hidden data-icon="inline-start" />
          {t.inspector.rotateRight}
        </Button>
      </div>
    </section>
  );
}
