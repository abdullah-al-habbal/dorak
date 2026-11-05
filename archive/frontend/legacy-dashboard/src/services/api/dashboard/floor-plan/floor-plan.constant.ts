export const FLOOR_PLAN_PRESETS = [
  "standard",
  "compact",
  "unisex_zoned",
] as const;
export const FLOOR_ZONES = ["men", "women", "shared"] as const;
export const FLOOR_PLAN_CANVAS_UNITS = ["m", "ft", "px"] as const;
export const FLOOR_DECORATION_TYPES = [
  "waiting_area",
  "mirror",
  "reception",
  "entrance",
  "restroom",
  "plant",
  "storage",
] as const;

export const FLOOR_PLAN_MAX_DECORATIONS = 30;
export const FLOOR_PLAN_MAX_ZONES = 8;
export const FLOOR_PLAN_MAX_CANVAS_SIZE = 1000;
export const FLOOR_PLAN_MAX_LABEL_LENGTH = 60;
export const FLOOR_PLAN_PERCENT_MAX = 100;
