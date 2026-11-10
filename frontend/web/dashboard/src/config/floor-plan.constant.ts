import { FloorDecorationType } from "@/enums/floor-decoration-type.enum";
import { FloorPlanPreset } from "@/enums/floor-plan-preset.enum";
import { FloorZone } from "@/enums/floor-zone.enum";

/** Chair positions and sizes are saved in stage units: the stage is this wide, and as tall as the canvas ratio makes it. */
export const STAGE_WIDTH = 1000;
export const KEYBOARD_STEP = 10;
export const KEYBOARD_BIG_STEP = 50;
export const ROTATION_STEP = 15;
export const ROTATION_LIMIT = 360;
export const MIN_CHAIR_SIZE = 1;
export const MAX_LAYOUT_VALUE = 10000;
export const PERCENT_MAX = 100;
export const DEFAULT_DECORATION_SIZE = 12;
export const MAX_CANVAS_SIZE = 1000;
export const FLOOR_PLAN_LABEL_MAX = 60;
/** The editor is for desktop and tablet; below this width the plan is read-only. */
export const FLOOR_PLAN_EDIT_MIN_WIDTH_PX = 768;

export const FLOOR_PLAN_PRESETS: readonly FloorPlanPreset[] = [FloorPlanPreset.Standard, FloorPlanPreset.Compact, FloorPlanPreset.UnisexZoned];
export const FLOOR_DECORATION_TYPES: readonly FloorDecorationType[] = [
  FloorDecorationType.WaitingArea,
  FloorDecorationType.Mirror,
  FloorDecorationType.Reception,
  FloorDecorationType.Entrance,
  FloorDecorationType.Restroom,
  FloorDecorationType.Plant,
  FloorDecorationType.Storage,
];

/** The two halves a "unisex zoned" plan needs, in percent of the canvas. */
export const UNISEX_ZONES = [
  { zone: FloorZone.Men, x: 0, y: 0, width: 50, height: 100 },
  { zone: FloorZone.Women, x: 50, y: 0, width: 50, height: 100 },
] as const;
