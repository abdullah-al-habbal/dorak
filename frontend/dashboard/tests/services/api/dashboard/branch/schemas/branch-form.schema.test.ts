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
      [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
        dayOfWeek,
        isClosed: false,
        opensTime: "09:00",
        closesTime: "21:00",
        ...overrides[dayOfWeek],
      }));

    it("accepts translated description, address and a full week", () => {
      const parsed = branchCreateSchema.safeParse({
        ...base,
        description: { en: "Downtown", ar: "وسط البلد" },
        address: { en: "Main St", ar: null },
        openingHours: week({
          5: { isClosed: true, opensTime: null, closesTime: null },
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
        { opensTime: "10:00", closesTime: "10:00" },
        { opensTime: "18:00", closesTime: "09:00" },
        { opensTime: "09:00", closesTime: null },
        { opensTime: "9am", closesTime: "21:00" },
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
