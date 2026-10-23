import { branchCreateSchema } from "@/services/api/dashboard/branch-form.schema";
import { describe, expect, it } from "vitest";

describe("branchCreateSchema", () => {
  it("requires valid identity, password, and coordinates", () => {
    expect(
      branchCreateSchema.safeParse({
        name: { en: "Main", ar: "الرئيسي" },
        brandId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab",
        email: "branch@example.com",
        password: "long-enough-password",
        latitude: null,
        longitude: null,
        status: "enabled",
        universe: "unisex",
      }).success,
    ).toBe(true);
    expect(branchCreateSchema.safeParse({}).success).toBe(false);
  });

  it("accepts only the venue universes", () => {
    const base = {
      name: { en: "Main", ar: "الرئيسي" },
      brandId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab",
      email: "branch@example.com",
      password: "long-enough-password",
      latitude: null,
      longitude: null,
      status: "enabled",
    };

    for (const universe of ["men", "women", "unisex"])
      expect(branchCreateSchema.safeParse({ ...base, universe }).success).toBe(
        true,
      );
    expect(
      branchCreateSchema.safeParse({ ...base, universe: "kids" }).success,
    ).toBe(false);
  });
});
