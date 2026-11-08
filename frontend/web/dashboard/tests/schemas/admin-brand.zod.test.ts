import { describe, expect, it } from "vitest";

import { BrandStatus } from "@/enums/brand-status.enum";
import { adminBrandSchema } from "@/schemas/admin-brand.zod";

const row = {
  id: "b1",
  name: { en: "E2E Pending Cuts", ar: "قصات" },
  description: { en: null, ar: null },
  logo_url: null,
  owner: { id: "c1", email: "owner@dorak.test" },
  base_currency: { id: "u1", code: "USD" },
  slug: "e2e-pending-cuts",
  universe: null,
  status: "pending",
  branches_count: 0,
  features: { multi_branch: false },
  created_at: "2020-01-01T00:00:00+00:00",
};

describe("admin brand schema", () => {
  it("parses a BrandResource row", () => {
    const brand = adminBrandSchema.parse(row);
    expect(brand.status).toBe(BrandStatus.Pending);
    expect(brand.owner?.email).toBe("owner@dorak.test");
  });

  it("reads an untranslated description, serialised as [], as no text", () => {
    expect(adminBrandSchema.parse({ ...row, description: [] }).description).toBeNull();
  });

  it("rejects a status the dashboard does not know", () => {
    expect(adminBrandSchema.safeParse({ ...row, status: "suspended" }).success).toBe(false);
  });

  it("accepts a brand without owner or currency relations", () => {
    expect(adminBrandSchema.safeParse({ ...row, owner: undefined, base_currency: undefined, branches_count: undefined }).success).toBe(true);
  });
});
