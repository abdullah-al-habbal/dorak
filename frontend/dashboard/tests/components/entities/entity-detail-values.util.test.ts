import { describe, expect, it } from "vitest";
import { detailValues } from "@/components/entities/entity-detail-values.util";

describe("detailValues", () => {
  const entity = {
    id: "b1",
    status: "confirmed",
    note: null,
    tags: ["a"],
    barber: { id: "s1", name: { en: "Sam", ar: "سام" } },
    chair: { label: "Chair 2", position: { x: 1, y: 2 } },
  };

  it("keeps scalars and drops nulls and arrays", () => {
    const paths = detailValues(entity, "en").map((row) => row.path);
    expect(paths).toContain("id");
    expect(paths).not.toContain("note");
    expect(paths).not.toContain("tags");
  });

  it("resolves localized names to the viewer locale", () => {
    const row = detailValues(entity, "ar").find(
      (item) => item.path === "barber.name",
    );
    expect(row?.value).toBe("سام");
  });

  it("flattens nested objects with dotted paths", () => {
    const rows = detailValues(entity, "en");
    expect(rows.find((row) => row.path === "chair.label")?.value).toBe(
      "Chair 2",
    );
    expect(rows.find((row) => row.path === "chair.position.x")?.key).toBe("x");
  });
});
