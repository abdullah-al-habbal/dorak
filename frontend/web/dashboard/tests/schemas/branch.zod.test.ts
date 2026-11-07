import { describe, expect, it } from "vitest";

import { branchDetailSchema, branchListSchema, brandOptionListSchema } from "@/schemas/branch.zod";

describe("branch response schemas", () => {
  it("parses a list row as the backend sends it", () => {
    const rows = branchListSchema.parse([
      { id: "1", name: "Downtown", email: "a@b.test", status: "enabled", latitude: null, brand_id: "b1", universe: "men", rating_average: 4.5, rating_count: 2, distance: null, tags: [] },
    ]);
    expect(rows[0]?.name).toBe("Downtown");
  });

  it("rejects an unknown status", () => {
    expect(branchListSchema.safeParse([{ id: "1", name: "x", status: "archived" }]).success).toBe(false);
  });

  it("parses the detail with both translations, string coordinates and null text", () => {
    const detail = branchDetailSchema.parse({ id: "1", brand_id: "b1", name: { en: "A", ar: "ب" }, email: "a@b.test", status: "pending", description: null, address: { en: "St", ar: null }, latitude: "24.1", longitude: null });
    expect(detail.address?.en).toBe("St");
    expect(detail.latitude).toBe("24.1");
  });

  it("parses brand options with a translated name", () => {
    expect(brandOptionListSchema.parse([{ id: "b1", name: { en: "Acme", ar: "أكمي" }, slug: "acme" }])).toHaveLength(1);
  });
});
