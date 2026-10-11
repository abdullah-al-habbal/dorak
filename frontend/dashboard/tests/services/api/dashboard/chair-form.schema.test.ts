import { chairFormSchema } from "@/services/api/dashboard/chair-form.schema";
import { describe, expect, it } from "vitest";

describe("chairFormSchema", () => {
  it("rejects non-positive dimensions", () => {
    expect(
      chairFormSchema.safeParse({
        label: "A1",
        branchId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab",
        barberId: null,
        floorZone: "shared",
        status: "available",
        positionX: 0,
        positionY: 0,
        width: 0,
        height: 1,
        rotation: null,
      }).success,
    ).toBe(false);
  });
});
