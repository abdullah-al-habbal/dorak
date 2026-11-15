import { describe, expect, it } from "vitest";

import { MAX_LAYOUT_VALUE, MIN_CHAIR_SIZE, STAGE_WIDTH } from "@/config/floor-plan.constant";
import { FloorCanvasUnit } from "@/enums/floor-canvas-unit.enum";
import { FloorDecorationType } from "@/enums/floor-decoration-type.enum";
import type { ChairLayoutPayload } from "@/interfaces/chairs/chair-payload.interface";
import {
  clamp,
  clampChair,
  clampDecoration,
  moveChair,
  moveDecoration,
  percentToUnits,
  pointerToStage,
  rotateChair,
  stageSize,
  unitsToPercent,
} from "@/lib/floor-plan-geometry.util";
import type { FloorDecoration } from "@/types/chairs/floor-plan.type";

const stage = { width: 1000, height: 500 };
const chair: ChairLayoutPayload = { position_x: 100, position_y: 100, width: 60, height: 60, rotation: 0 };
const decoration: FloorDecoration = { type: FloorDecorationType.Mirror, x: 10, y: 10, width: 20, height: 20 };

describe("floor plan geometry", () => {
  it("clamps a value into a range", () => {
    expect([clamp(5, 0, 10), clamp(-1, 0, 10), clamp(11, 0, 10)]).toEqual([5, 0, 10]);
  });

  it("keeps the canvas ratio on a stage of fixed width", () => {
    expect(stageSize({ width: 20, height: 10, unit: FloorCanvasUnit.Meters })).toEqual({ width: STAGE_WIDTH, height: 500 });
    expect(stageSize({ width: 30, height: 40, unit: FloorCanvasUnit.Feet }).height).toBe(1333);
  });

  it("pulls a chair back inside the stage", () => {
    expect(clampChair({ ...chair, position_x: 990, position_y: -20 }, stage)).toMatchObject({ position_x: 940, position_y: 0 });
    expect(clampChair({ ...chair, position_x: 0, position_y: 480 }, stage)).toMatchObject({ position_y: 440 });
  });

  it("limits chair size to the minimum, the stage and the backend limit", () => {
    expect(clampChair({ ...chair, width: 0, height: -5 }, stage)).toMatchObject({ width: MIN_CHAIR_SIZE, height: MIN_CHAIR_SIZE });
    const huge = clampChair({ ...chair, width: 99999, height: 99999 }, stage);
    expect(huge).toMatchObject({ width: 1000, height: 500, position_x: 0, position_y: 0 });
    const bigStage = clampChair({ ...chair, width: 99999 }, { width: 50000, height: 50000 });
    expect(bigStage.width).toBe(MAX_LAYOUT_VALUE);
  });

  it("moves a chair and clamps the result", () => {
    expect(moveChair(chair, 10, -10, stage)).toMatchObject({ position_x: 110, position_y: 90 });
    expect(moveChair(chair, -500, 5000, stage)).toMatchObject({ position_x: 0, position_y: 440 });
  });

  it("rotates and wraps within the backend's range", () => {
    expect(rotateChair(chair, 15).rotation).toBe(15);
    expect(rotateChair({ ...chair, rotation: null }, 15).rotation).toBe(15);
    expect(rotateChair({ ...chair, rotation: 350 }, 15).rotation).toBe(5);
    expect(rotateChair({ ...chair, rotation: 0 }, -15).rotation).toBe(-15);
  });

  it("keeps a decoration inside 0 to 100 percent", () => {
    expect(clampDecoration({ ...decoration, x: 95, y: -5 })).toMatchObject({ x: 80, y: 0 });
    expect(clampDecoration({ ...decoration, width: 0, height: 500 })).toMatchObject({ width: 1, height: 100, y: 0 });
    expect(moveDecoration(decoration, 100, 100)).toMatchObject({ x: 80, y: 80 });
  });

  it("converts between stage units and percent of the canvas", () => {
    expect(unitsToPercent(100, 50, stage)).toEqual({ x: 10, y: 10 });
    expect(percentToUnits({ x: 10, y: 10, width: 20, height: 20 }, stage)).toEqual({ x: 100, y: 50, width: 200, height: 100 });
  });

  it("maps a pointer on the svg box onto the stage", () => {
    const box = { left: 100, top: 50, width: 500, height: 250 };
    expect(pointerToStage(350, 175, box, stage)).toEqual({ x: 500, y: 250 });
    expect(pointerToStage(100, 50, box, stage)).toEqual({ x: 0, y: 0 });
  });
});
