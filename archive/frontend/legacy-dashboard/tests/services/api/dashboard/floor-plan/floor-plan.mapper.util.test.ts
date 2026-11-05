import { describe, expect, it } from "vitest";
import {
  floorPlanPayload,
  mapFloorPlan,
} from "@/services/api/dashboard/floor-plan/floor-plan.mapper.util";

describe("mapFloorPlan", () => {
  it("maps canvas, zones, decorations and chairs", () => {
    const plan = mapFloorPlan({
      branch_id: "b1",
      branch_name: "Main",
      floor_plan: {
        preset: "unisex_zoned",
        zones: [{ zone: "men", x: 0, y: 0, width: 50, height: 100 }],
        canvas: { width: 30, height: 12, unit: "ft" },
        decorations: [
          { type: "mirror", x: 1, y: 2, width: 3, height: 4, label: "M" },
        ],
      },
      chairs: [
        { id: "c1", label: "A", status: "available", floor_zone: "men" },
      ],
    });

    expect(plan.layout.canvas).toEqual({ width: 30, height: 12, unit: "ft" });
    expect(plan.layout.decorations[0]).toMatchObject({
      type: "mirror",
      label: "M",
    });
    expect(plan.chairs[0]).toEqual({
      id: "c1",
      label: "A",
      status: "available",
      floorZone: "men",
    });
  });

  it("falls back safely on malformed input", () => {
    const plan = mapFloorPlan(null);
    expect(plan.layout.preset).toBe("standard");
    expect(plan.layout.decorations).toEqual([]);
    expect(plan.chairs).toEqual([]);
  });
});

describe("floorPlanPayload", () => {
  it("drops zones unless the preset is unisex_zoned and nulls empty labels", () => {
    const payload = floorPlanPayload({
      preset: "standard",
      zones: [{ zone: "men", x: 0, y: 0, width: 10, height: 10 }],
      canvas: { width: 1, height: 1, unit: "m" },
      decorations: [
        { type: "plant", x: 0, y: 0, width: 1, height: 1, label: "" },
      ],
    });

    expect(payload.zones).toEqual([]);
    expect(payload.decorations[0]?.label).toBeNull();
  });
});
