export const FACE_SHAPES = [
  "oval",
  "round",
  "square",
  "heart",
  "diamond",
  "oblong",
  "triangle",
] as const;
export const HAIR_TEXTURES = ["straight", "wavy", "curly", "coily"] as const;

export const MAX_DURATION_MINUTES = 1440;

export const CATALOG_QUERY_KEYS = {
  items: ["dashboard", "catalog-items"],
  lookups: ["lookups", "service-catalog-items"],
} as const;
