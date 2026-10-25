import { branchCreateSchema } from "@/services/api/dashboard/branch/schemas/branch-form.schema";
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

  describe("storefront fields", () => {
    const base = {
      name: { en: "Main", ar: "الرئيسي" },
      brandId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab",
      email: "branch@example.com",
      password: "long-enough-password",
      latitude: null,
      longitude: null,
      status: "enabled",
      universe: "unisex",
    };
    const week = (overrides: Record<number, object> = {}) =>
      [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
        weekday,
        isClosed: false,
        opensAt: "09:00",
        closesAt: "21:00",
        ...overrides[weekday],
      }));

    it("accepts translated description, address and a full week", () => {
      const parsed = branchCreateSchema.safeParse({
        ...base,
        description: { en: "Downtown", ar: "وسط البلد" },
        address: { en: "Main St", ar: null },
        openingHours: week({
          5: { isClosed: true, opensAt: null, closesAt: null },
        }),
      });

      expect(parsed.success).toBe(true);
    });

    it("defaults the optional text to empty locales", () => {
      const parsed = branchCreateSchema.parse(base);

      expect(parsed.description).toEqual({ en: null, ar: null });
      expect(parsed.openingHours).toBeUndefined();
    });

    it("rejects closing at or before opening and half-filled days", () => {
      for (const day of [
        { opensAt: "10:00", closesAt: "10:00" },
        { opensAt: "18:00", closesAt: "09:00" },
        { opensAt: "09:00", closesAt: null },
        { opensAt: "9am", closesAt: "21:00" },
      ])
        expect(
          branchCreateSchema.safeParse({
            ...base,
            openingHours: week({ 2: day }),
          }).success,
        ).toBe(false);
    });

    it("needs all seven days and caps the description length", () => {
      expect(
        branchCreateSchema.safeParse({ ...base, openingHours: week().slice(1) })
          .success,
      ).toBe(false);
      expect(
        branchCreateSchema.safeParse({
          ...base,
          description: { en: "x".repeat(2001), ar: null },
        }).success,
      ).toBe(false);
    });
  });
});
