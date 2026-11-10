"use client";

import { RotateCcwIcon, RotateCwIcon, Trash2Icon } from "lucide-react";
import type { JSX } from "react";

import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FLOOR_PLAN_LABEL_MAX, ROTATION_STEP } from "@/config/floor-plan.constant";
import { useI18n } from "@/hooks/use-i18n";
import type { FloorPlanEditor } from "@/hooks/use-floor-plan-editor";
import { rotateChair } from "@/lib/floor-plan-geometry.util";
import type { Chair } from "@/types/chair.type";

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function NumberField({ id, label, value, onChange }: NumberFieldProps): JSX.Element {
  return (
    <FormField id={id} label={label}>
      <Input id={id} type="number" inputMode="decimal" dir="ltr" value={Math.round(value * 10) / 10} onChange={(event) => onChange(Number(event.target.value))} />
    </FormField>
  );
}

/** Exact values for the selected item: the keyboard-free alternative to dragging. */
export function FloorPlanInspector({ editor, chairs }: { editor: FloorPlanEditor; chairs: readonly Chair[] }): JSX.Element {
  const { dictionary } = useI18n();
  const { floorPlan: t } = dictionary;
  const { selection, draft } = editor;
  const chair = selection?.kind === "chair" ? chairs.find((candidate) => candidate.id === selection.id) : undefined;
  const layout = chair ? draft.chairs[chair.id] : undefined;
  const decoration = selection?.kind === "decoration" ? draft.decorations.find((item) => item.key === selection.id) : undefined;

  if (chair && layout) {
    const set = (patch: Partial<typeof layout>): void => editor.setChair(chair.id, { ...layout, ...patch });
    return (
      <section aria-label={t.inspector.chair} className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <h3 dir="auto" className="font-medium">{chair.label || t.chair}</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberField id="chair-x" label={t.inspector.x} value={layout.position_x} onChange={(value) => set({ position_x: value })} />
          <NumberField id="chair-y" label={t.inspector.y} value={layout.position_y} onChange={(value) => set({ position_y: value })} />
          <NumberField id="chair-w" label={t.inspector.width} value={layout.width} onChange={(value) => set({ width: value })} />
          <NumberField id="chair-h" label={t.inspector.height} value={layout.height} onChange={(value) => set({ height: value })} />
          <NumberField id="chair-r" label={t.inspector.rotation} value={layout.rotation ?? 0} onChange={(value) => set({ rotation: value })} />
        </div>
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

  if (decoration) {
    const set = (patch: Partial<typeof decoration>): void => editor.setDecoration(decoration.key, patch);
    return (
      <section aria-label={t.inspector.decoration} className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <h3 className="font-medium">{t.decoration[decoration.type]}</h3>
        <FormField id="decoration-label" label={t.inspector.label}>
          <Input id="decoration-label" dir="auto" maxLength={FLOOR_PLAN_LABEL_MAX} value={decoration.label ?? ""} onChange={(event) => set({ label: event.target.value === "" ? null : event.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <NumberField id="decoration-x" label={t.inspector.xPercent} value={decoration.x} onChange={(value) => set({ x: value })} />
          <NumberField id="decoration-y" label={t.inspector.yPercent} value={decoration.y} onChange={(value) => set({ y: value })} />
          <NumberField id="decoration-w" label={t.inspector.widthPercent} value={decoration.width} onChange={(value) => set({ width: value })} />
          <NumberField id="decoration-h" label={t.inspector.heightPercent} value={decoration.height} onChange={(value) => set({ height: value })} />
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

  return <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{t.inspector.none}</p>;
}
