import type { ChairLayoutPayload } from "@/interfaces/chairs/chair-payload.interface";
import type { FloorPlanPreset } from "@/enums/venue/floor-plan-preset.enum";
import type { FloorZone } from "@/enums/people/floor-zone.enum";
import type { FloorCanvas, FloorDecoration, FloorZoneRect } from "@/types/chairs/floor-plan.type";

/** The editor's working copy. Decorations carry a local key so a drag keeps its identity. */
export interface FloorDecorationDraft extends FloorDecoration {
  key: string;
}

export interface FloorPlanDraft {
  preset: FloorPlanPreset;
  canvas: FloorCanvas;
  decorations: FloorDecorationDraft[];
  /** Chair layouts by chair id; only chairs the user moved differ from the saved plan. */
  chairs: Record<string, ChairLayoutPayload>;
  /** The men and women halves of a zoned plan, in percent of the canvas; kept even when another preset is on. */
  zones: FloorZoneRect[];
  /** Each chair's zone by chair id. */
  chairZones: Record<string, FloorZone>;
}

export type FloorSelection = { kind: "chair" | "decoration" | "zone"; id: string } | null;
