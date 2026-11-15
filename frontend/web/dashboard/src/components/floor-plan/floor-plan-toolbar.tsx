"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";

import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FLOOR_DECORATION_TYPES, FLOOR_PLAN_PRESETS, MAX_CANVAS_SIZE } from "@/config/venue/floor-plan.constant";
import { FloorCanvasUnit } from "@/enums/venue/floor-canvas-unit.enum";
import { FloorDecorationType } from "@/enums/venue/floor-decoration-type.enum";
import type { FloorPlanPreset } from "@/enums/venue/floor-plan-preset.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { FloorPlanEditor } from "@/hooks/chairs/use-floor-plan-editor";

const UNITS: readonly FloorCanvasUnit[] = [FloorCanvasUnit.Meters, FloorCanvasUnit.Feet, FloorCanvasUnit.Pixels];

function asUnit(value: string): FloorCanvasUnit {
  return UNITS.find((unit) => unit === value) ?? FloorCanvasUnit.Meters;
}

function asDecoration(value: string): FloorDecorationType {
  return FLOOR_DECORATION_TYPES.find((type) => type === value) ?? FloorDecorationType.WaitingArea;
}

function asPreset(value: string): FloorPlanPreset {
  return FLOOR_PLAN_PRESETS.find((preset) => preset === value) ?? FLOOR_PLAN_PRESETS[0];
}

/** Preset, canvas size and the decoration palette. */
export function FloorPlanToolbar({ editor }: { editor: FloorPlanEditor }): JSX.Element {
  const { dictionary } = useI18n();
  const { floorPlan: t } = dictionary;
  const { draft } = editor;
  const [type, setType] = useState<FloorDecorationType>(FloorDecorationType.WaitingArea);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <FormField id="floor-preset" label={t.preset.label}>
        <NativeSelect id="floor-preset" value={draft.preset} onChange={(event) => editor.setPreset(asPreset(event.target.value))}>
          {FLOOR_PLAN_PRESETS.map((preset) => (
            <option key={preset} value={preset}>{t.preset[preset]}</option>
          ))}
        </NativeSelect>
      </FormField>
      <div className="grid grid-cols-3 gap-2">
        <FormField id="floor-width" label={t.canvas.width}>
          <Input id="floor-width" type="number" inputMode="decimal" dir="ltr" min={1} max={MAX_CANVAS_SIZE} value={draft.canvas.width} onChange={(event) => editor.setCanvas({ width: Number(event.target.value) })} />
        </FormField>
        <FormField id="floor-height" label={t.canvas.height}>
          <Input id="floor-height" type="number" inputMode="decimal" dir="ltr" min={1} max={MAX_CANVAS_SIZE} value={draft.canvas.height} onChange={(event) => editor.setCanvas({ height: Number(event.target.value) })} />
        </FormField>
        <FormField id="floor-unit" label={t.canvas.unit}>
          <NativeSelect id="floor-unit" value={draft.canvas.unit} onChange={(event) => editor.setCanvas({ unit: asUnit(event.target.value) })}>
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </NativeSelect>
        </FormField>
      </div>
      <FormField id="floor-decoration" label={t.addDecoration}>
        <NativeSelect id="floor-decoration" value={type} onChange={(event) => setType(asDecoration(event.target.value))}>
          {FLOOR_DECORATION_TYPES.map((option) => (
            <option key={option} value={option}>{t.decoration[option]}</option>
          ))}
        </NativeSelect>
      </FormField>
      <div className="flex items-end">
        <Button type="button" variant="outline" onClick={() => editor.addDecoration(type)}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.add}
        </Button>
      </div>
    </div>
  );
}
