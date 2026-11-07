import { describe, expect, it } from "vitest";

import { createChairSchema } from "@/schemas/chair-form.zod";
import { enDictionary } from "@/locales/en/index.constant";

const schema = createChairSchema(enDictionary.chairs.form.validation);
const valid = { label: "Chair 9", floor_zone: "men", status: "available", branch_id: "b1" };

describe("chair form schema", () => {
  it("accepts a complete form and trims the label", () => {
    expect(schema.parse({ ...valid, label: "  Chair 9 " }).label).toBe("Chair 9");
  });

  it("rejects an empty or oversized label and unknown enums", () => {
    expect(schema.safeParse({ ...valid, label: "   " }).success).toBe(false);
    expect(schema.safeParse({ ...valid, label: "x".repeat(121) }).success).toBe(false);
    expect(schema.safeParse({ ...valid, floor_zone: "roof" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, branch_id: "" }).success).toBe(false);
  });
});
