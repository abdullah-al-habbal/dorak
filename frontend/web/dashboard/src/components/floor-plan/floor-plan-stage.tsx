"use client";

import { useRef } from "react";
import type { JSX, KeyboardEvent, PointerEvent } from "react";

import { KEYBOARD_BIG_STEP, KEYBOARD_STEP, ROTATION_STEP, UNISEX_ZONES } from "@/config/venue/floor-plan.constant";
import { FloorPlanPreset } from "@/enums/venue/floor-plan-preset.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { FloorPlanEditor } from "@/hooks/chairs/use-floor-plan-editor";
import { moveChair, moveDecoration, percentToUnits, pointerToStage, rotateChair, stageSize, unitsToPercent } from "@/lib/chairs/floor-plan-geometry.util";
import { cn } from "@/lib/utils";
import type { Chair } from "@/types/chairs/chair.type";

interface DragState {
  kind: "chair" | "decoration";
  id: string;
  offsetX: number;
  offsetY: number;
}

interface FloorPlanStageProps {
  editor: FloorPlanEditor;
  chairs: readonly Chair[];
  /** No dragging, no keyboard edits: the phone and admin view. */
  readOnly: boolean;
}

/** The plan as an svg in stage units. Items drag with the pointer and move with the arrow keys; `[` and `]` rotate a chair, Delete removes a decoration. */
export function FloorPlanStage({ editor, chairs, readOnly }: FloorPlanStageProps): JSX.Element {
  const { dictionary } = useI18n();
  const { floorPlan: t } = dictionary;
  const { draft, selection } = editor;
  const stage = stageSize(draft.canvas);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<DragState | null>(null);

  function pointer(event: PointerEvent): { x: number; y: number } {
    const box = svg.current?.getBoundingClientRect();
    return box ? pointerToStage(event.clientX, event.clientY, box, stage) : { x: 0, y: 0 };
  }

  function begin(event: PointerEvent<SVGGElement>, kind: DragState["kind"], id: string, originX: number, originY: number): void {
    editor.select({ kind, id });
    if (readOnly) return;
    const at = pointer(event);
    drag.current = { kind, id, offsetX: at.x - originX, offsetY: at.y - originY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<SVGSVGElement>): void {
    const active = drag.current;
    if (!active) return;
    const at = pointer(event);
    if (active.kind === "chair") {
      const layout = draft.chairs[active.id];
      if (layout) editor.setChair(active.id, { ...layout, position_x: at.x - active.offsetX, position_y: at.y - active.offsetY });
      return;
    }
    const item = draft.decorations.find((candidate) => candidate.key === active.id);
    if (!item) return;
    const percent = unitsToPercent(at.x - active.offsetX, at.y - active.offsetY, stage);
    editor.setDecoration(active.id, { x: percent.x, y: percent.y });
  }

  function key(event: KeyboardEvent<SVGGElement>, kind: DragState["kind"], id: string): void {
    if (readOnly) return;
    const step = event.shiftKey ? KEYBOARD_BIG_STEP : KEYBOARD_STEP;
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    if (delta) {
      event.preventDefault();
      if (kind === "chair") {
        const layout = draft.chairs[id];
        if (layout) editor.setChair(id, moveChair(layout, delta[0], delta[1], stage));
      } else {
        const item = draft.decorations.find((candidate) => candidate.key === id);
        const percent = unitsToPercent(delta[0], delta[1], stage);
        if (item) editor.setDecoration(id, moveDecoration(item, percent.x, percent.y));
      }
      return;
    }
    if (kind === "chair" && (event.key === "[" || event.key === "]")) {
      const layout = draft.chairs[id];
      if (layout) editor.setChair(id, rotateChair(layout, event.key === "]" ? ROTATION_STEP : -ROTATION_STEP));
      return;
    }
    if (kind === "decoration" && (event.key === "Delete" || event.key === "Backspace")) {
      event.preventDefault();
      editor.removeDecoration(id);
    }
  }

  const chosen = (kind: DragState["kind"], id: string): boolean => selection?.kind === kind && selection.id === id;

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${stage.width} ${stage.height}`}
      role="group"
      aria-label={t.stage.label.replace("{width}", String(draft.canvas.width)).replace("{height}", String(draft.canvas.height)).replace("{unit}", draft.canvas.unit)}
      className="w-full touch-none rounded-xl border border-border bg-muted/30"
      onPointerMove={move}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      {draft.preset === FloorPlanPreset.UnisexZoned
        ? UNISEX_ZONES.map((zone) => {
            const box = percentToUnits(zone, stage);
            return (
              <g key={zone.zone} aria-hidden>
                <rect {...box} className="fill-transparent stroke-border" strokeDasharray="12 8" />
                <text x={box.x + 16} y={box.y + 32} className="fill-muted-foreground text-[24px]">{t.zone[zone.zone]}</text>
              </g>
            );
          })
        : null}
      {draft.decorations.map((item) => {
        const box = percentToUnits(item, stage);
        const label = item.label || t.decoration[item.type];
        return (
          <g
            key={item.key}
            tabIndex={readOnly ? -1 : 0}
            role="button"
            aria-label={label}
            aria-pressed={chosen("decoration", item.key)}
            className="cursor-grab outline-none focus-visible:[&>rect]:stroke-ring"
            onPointerDown={(event) => begin(event, "decoration", item.key, box.x, box.y)}
            onKeyDown={(event) => key(event, "decoration", item.key)}
            onFocus={() => editor.select({ kind: "decoration", id: item.key })}
          >
            <rect {...box} rx={8} className={cn("fill-secondary stroke-border", chosen("decoration", item.key) ? "stroke-primary" : "")} strokeWidth={chosen("decoration", item.key) ? 5 : 2} strokeDasharray="6 4" />
            <text x={box.x + box.width / 2} y={box.y + box.height / 2} textAnchor="middle" dominantBaseline="middle" className="pointer-events-none fill-secondary-foreground text-[22px]">{label}</text>
          </g>
        );
      })}
      {chairs.map((chair) => {
        const layout = draft.chairs[chair.id];
        if (!layout) return null;
        const label = chair.label || t.chair;
        const cx = layout.position_x + layout.width / 2;
        const cy = layout.position_y + layout.height / 2;
        const picked = chosen("chair", chair.id);
        return (
          <g
            key={chair.id}
            tabIndex={readOnly ? -1 : 0}
            role="button"
            aria-label={t.stage.chair.replace("{label}", label)}
            aria-pressed={picked}
            className="cursor-grab outline-none focus-visible:[&>rect]:stroke-ring focus-visible:[&>ellipse]:stroke-ring"
            transform={`rotate(${layout.rotation ?? 0} ${cx} ${cy})`}
            onPointerDown={(event) => begin(event, "chair", chair.id, layout.position_x, layout.position_y)}
            onKeyDown={(event) => key(event, "chair", chair.id)}
            onFocus={() => editor.select({ kind: "chair", id: chair.id })}
          >
            {layout.shape === "rectangle" || !layout.shape ? (
              <rect x={layout.position_x} y={layout.position_y} width={layout.width} height={layout.height} rx={10} className="fill-primary/15 stroke-primary" strokeWidth={picked ? 6 : 2} />
            ) : (
              <ellipse cx={cx} cy={cy} rx={layout.width / 2} ry={layout.height / 2} className="fill-primary/15 stroke-primary" strokeWidth={picked ? 6 : 2} />
            )}
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${-(layout.rotation ?? 0)} ${cx} ${cy})`} className="pointer-events-none fill-foreground text-[22px]">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}
