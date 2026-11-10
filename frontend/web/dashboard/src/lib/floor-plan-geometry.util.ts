import { MAX_LAYOUT_VALUE, MIN_CHAIR_SIZE, PERCENT_MAX, ROTATION_LIMIT, STAGE_WIDTH } from "@/config/floor-plan.constant";
import type { ChairLayoutPayload } from "@/interfaces/chair-payload.interface";
import type { FloorCanvas, FloorDecoration } from "@/types/floor-plan.type";

export interface StageSize {
  width: number;
  height: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** The stage keeps the canvas ratio, `STAGE_WIDTH` units wide. */
export function stageSize(canvas: FloorCanvas): StageSize {
  return { width: STAGE_WIDTH, height: Math.round((STAGE_WIDTH * canvas.height) / canvas.width) };
}

/** A chair stays inside the stage (and the backend's own limits). */
export function clampChair(layout: ChairLayoutPayload, stage: StageSize): ChairLayoutPayload {
  const width = clamp(layout.width, MIN_CHAIR_SIZE, Math.min(stage.width, MAX_LAYOUT_VALUE));
  const height = clamp(layout.height, MIN_CHAIR_SIZE, Math.min(stage.height, MAX_LAYOUT_VALUE));
  return {
    ...layout,
    width,
    height,
    position_x: clamp(layout.position_x, 0, stage.width - width),
    position_y: clamp(layout.position_y, 0, stage.height - height),
  };
}

export function moveChair(layout: ChairLayoutPayload, dx: number, dy: number, stage: StageSize): ChairLayoutPayload {
  return clampChair({ ...layout, position_x: layout.position_x + dx, position_y: layout.position_y + dy }, stage);
}

/** Rotation wraps into the backend's -360 to 360 range. */
export function rotateChair(layout: ChairLayoutPayload, delta: number): ChairLayoutPayload {
  const next = ((layout.rotation ?? 0) + delta) % ROTATION_LIMIT;
  return { ...layout, rotation: next };
}

/** Decorations are saved in percent of the canvas. */
export function clampDecoration(item: FloorDecoration): FloorDecoration {
  const width = clamp(item.width, 1, PERCENT_MAX);
  const height = clamp(item.height, 1, PERCENT_MAX);
  return { ...item, width, height, x: clamp(item.x, 0, PERCENT_MAX - width), y: clamp(item.y, 0, PERCENT_MAX - height) };
}

export function moveDecoration(item: FloorDecoration, dxPercent: number, dyPercent: number): FloorDecoration {
  return clampDecoration({ ...item, x: item.x + dxPercent, y: item.y + dyPercent });
}

/** Stage units to percent of the canvas along each axis. */
export function unitsToPercent(dx: number, dy: number, stage: StageSize): { x: number; y: number } {
  return { x: (dx / stage.width) * PERCENT_MAX, y: (dy / stage.height) * PERCENT_MAX };
}

export function percentToUnits(item: { x: number; y: number; width: number; height: number }, stage: StageSize): { x: number; y: number; width: number; height: number } {
  return {
    x: (item.x / PERCENT_MAX) * stage.width,
    y: (item.y / PERCENT_MAX) * stage.height,
    width: (item.width / PERCENT_MAX) * stage.width,
    height: (item.height / PERCENT_MAX) * stage.height,
  };
}

/** Where a pointer is on the stage, from the svg's on-screen box. */
export function pointerToStage(clientX: number, clientY: number, box: { left: number; top: number; width: number; height: number }, stage: StageSize): { x: number; y: number } {
  return { x: ((clientX - box.left) / box.width) * stage.width, y: ((clientY - box.top) / box.height) * stage.height };
}
