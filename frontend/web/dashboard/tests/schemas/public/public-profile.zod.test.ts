import { describe, expect, it } from "vitest";

import { publicBrandProfileSchema, publicBranchProfileSchema } from "@/schemas/public/public-profile.zod";

describe("public profile schemas", () => {
  it("reads Laravel's empty translation list as no text", () => {
    const brand = publicBrandProfileSchema.parse({ slug: "a", name: { en: "A", ar: "أ" }, description: [], logo_url: null, branches: [] });
    expect(brand.description).toEqual({});
  });

  it("reads a branch with translatable tags, hours and a coordinate sent as a string", () => {
    const branch = publicBranchProfileSchema.parse({
      slug: "downtown",
      name: { en: "Downtown", ar: "وسط" },
      description: [],
      address: { en: "St", ar: "ش" },
      tags: [{ en: "Kids", ar: "أطفال" }],
      latitude: "33.5",
      longitude: null,
      brand: null,
      stylists: [],
      services: [{ name: { en: "Cut", ar: "قص" }, price_amount_minor: 1500, currency_code: "USD" }],
      opening_hours: [{ day_of_week: 1, is_closed: false, shifts: [{ opens_time: "09:00:00", closes_time: "17:00:00" }] }],
      rating_average: null,
      rating_count: 0,
    });
    expect(branch.latitude).toBe(33.5);
    expect(branch.tags[0]?.ar).toBe("أطفال");
    expect(branch.services[0]?.is_at_home).toBe(false);
  });

  it("rejects a legacy plain-string tag", () => {
    expect(publicBranchProfileSchema.safeParse({ tags: ["beard"] }).success).toBe(false);
  });
});
