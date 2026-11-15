"use client";

import { useRef, useState } from "react";

import type { FloorDecorationType } from "@/enums/floor-decoration-type.enum";
import type { FloorPlanPreset } from "@/enums/floor-plan-preset.enum";
import type { ChairLayoutPayload } from "@/interfaces/chairs/chair-payload.interface";
import type { FloorDecorationDraft, FloorPlanDraft, FloorSelection } from "@/interfaces/chairs/floor-plan-draft.interface";
import { clampChair, clampDecoration, stageSize } from "@/lib/chairs/floor-plan-geometry.util";
import { isDirty, newDecoration, planToDraft } from "@/lib/chairs/floor-plan-draft.util";
import type { FloorCanvas, FloorPlan } from "@/types/chairs/floor-plan.type";

export interface FloorPlanEditor {
  draft: FloorPlanDraft;
  saved: FloorPlanDraft;
  selection: FloorSelection;
  dirty: boolean;
  select: (selection: FloorSelection) => void;
  setPreset: (preset: FloorPlanPreset) => void;
  setCanvas: (patch: Partial<FloorCanvas>) => void;
  setChair: (id: string, layout: ChairLayoutPayload) => void;
  addDecoration: (type: FloorDecorationType) => void;
  setDecoration: (key: string, patch: Partial<FloorDecorationDraft>) => void;
  removeDecoration: (key: string) => void;
  discard: () => void;
}

/** The working copy of one branch's plan. The panel remounts it with a new `key` after a save, so it starts from fresh data. */
export function useFloorPlanEditor(plan: FloorPlan): FloorPlanEditor {
  const [saved] = useState(() => planToDraft(plan));
  const [draft, setDraft] = useState<FloorPlanDraft>(saved);
  const [selection, setSelection] = useState<FloorSelection>(null);
  const counter = useRef(0);

  function setPreset(preset: FloorPlanPreset): void {
    setDraft((current) => ({ ...current, preset }));
  }

  /** Changing the canvas ratio re-fits every chair into the new stage. */
  function setCanvas(patch: Partial<FloorCanvas>): void {
    setDraft((current) => {
      const canvas = { ...current.canvas, ...patch };
      if (!(canvas.width > 0 && canvas.height > 0)) return { ...current, canvas };
      const stage = stageSize(canvas);
      return { ...current, canvas, chairs: Object.fromEntries(Object.entries(current.chairs).map(([id, layout]) => [id, clampChair(layout, stage)])) };
    });
  }

  function setChair(id: string, layout: ChairLayoutPayload): void {
    setDraft((current) => ({ ...current, chairs: { ...current.chairs, [id]: clampChair(layout, stageSize(current.canvas)) } }));
  }

  function addDecoration(type: FloorDecorationType): void {
    counter.current += 1;
    const item = newDecoration(type, `new-${counter.current}`);
    setDraft((current) => ({ ...current, decorations: [...current.decorations, item] }));
    setSelection({ kind: "decoration", id: item.key });
  }

  function setDecoration(key: string, patch: Partial<FloorDecorationDraft>): void {
    setDraft((current) => ({
      ...current,
      decorations: current.decorations.map((item) => (item.key === key ? { ...clampDecoration({ ...item, ...patch }), key } : item)),
    }));
  }

  function removeDecoration(key: string): void {
    setDraft((current) => ({ ...current, decorations: current.decorations.filter((item) => item.key !== key) }));
    setSelection(null);
  }

  function discard(): void {
    setDraft(saved);
    setSelection(null);
  }

  return { draft, saved, selection, dirty: isDirty(draft, saved), select: setSelection, setPreset, setCanvas, setChair, addDecoration, setDecoration, removeDecoration, discard };
}
