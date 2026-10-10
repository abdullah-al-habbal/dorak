import { branchCreateSchema } from "@/services/api/dashboard/branch-form.schema";
import { describe, expect, it } from "vitest";

describe("branchCreateSchema", () => {
  it("requires valid identity, password, and coordinates", () => {
    expect(branchCreateSchema.safeParse({ name: { en: "Main", ar: "الرئيسي" }, brandId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab", email: "branch@example.com", password: "long-enough-password", latitude: null, longitude: null, status: "enabled" }).success).toBe(true);
    expect(branchCreateSchema.safeParse({}).success).toBe(false);
  });
});
