import { describe, expect, it } from "vitest";
import { floorPlanFormSchema } from "@/services/api/dashboard/floor-plan/schemas/floor-plan.schema";

const base = {
  preset: "standard",
  zones: [],
  canvas: { width: "20", height: "10", unit: "m" },
  decorations: [],
};

describe("floorPlanFormSchema", () => {
  it("coerces numeric canvas input", () => {
    const parsed = floorPlanFormSchema.parse(base);
    expect(parsed.canvas.width).toBe(20);
  });

  it("rejects a non-positive canvas and an unknown unit", () => {
    const result = floorPlanFormSchema.safeParse({
      ...base,
      canvas: { width: 0, height: 10, unit: "parsec" },
    });
    expect(result.success).toBe(false);
  });

  it("requires both men and women zones for the unisex preset", () => {
    const zone = (name: string) => ({
      zone: name,
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    });
    expect(
      floorPlanFormSchema.safeParse({
        ...base,
        preset: "unisex_zoned",
        zones: [zone("men")],
      }).success,
    ).toBe(false);
    expect(
      floorPlanFormSchema.safeParse({
        ...base,
        preset: "unisex_zoned",
        zones: [zone("men"), zone("women")],
      }).success,
    ).toBe(true);
  });
});
