"use client";

import { Trash2Icon } from "lucide-react";
import type { JSX } from "react";

import { FormField } from "@/components/common/form-field";
import { InspectorNumberField } from "@/components/floor-plan/inspector/inspector-number-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FLOOR_PLAN_LABEL_MAX } from "@/config/venue/floor-plan.constant";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { FloorPlanEditor } from "@/hooks/chairs/use-floor-plan-editor";
import type { FloorDecorationDraft } from "@/interfaces/chairs/floor-plan-draft.interface";

/** Label, exact position and size of the selected decoration. */
export function DecorationInspector({ editor, decoration }: { editor: FloorPlanEditor; decoration: FloorDecorationDraft }): JSX.Element {
  const { dictionary } = useI18n();
  const { floorPlan: t } = dictionary;
  const set = (patch: Partial<FloorDecorationDraft>): void => editor.setDecoration(decoration.key, patch);

  return (
    <section aria-label={t.inspector.decoration} className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <h3 className="font-medium">{t.decoration[decoration.type]}</h3>
      <FormField id="decoration-label" label={t.inspector.label}>
        <Input id="decoration-label" dir="auto" maxLength={FLOOR_PLAN_LABEL_MAX} value={decoration.label ?? ""} onChange={(event) => set({ label: event.target.value === "" ? null : event.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <InspectorNumberField id="decoration-x" label={t.inspector.xPercent} value={decoration.x} onChange={(value) => set({ x: value })} />
        <InspectorNumberField id="decoration-y" label={t.inspector.yPercent} value={decoration.y} onChange={(value) => set({ y: value })} />
        <InspectorNumberField id="decoration-w" label={t.inspector.widthPercent} value={decoration.width} onChange={(value) => set({ width: value })} />
        <InspectorNumberField id="decoration-h" label={t.inspector.heightPercent} value={decoration.height} onChange={(value) => set({ height: value })} />
      </div>
      <div>
        <Button type="button" variant="outline" size="sm" onClick={() => editor.removeDecoration(decoration.key)}>
          <Trash2Icon aria-hidden data-icon="inline-start" />
          {t.inspector.remove}
        </Button>
      </div>
    </section>
  );
}
