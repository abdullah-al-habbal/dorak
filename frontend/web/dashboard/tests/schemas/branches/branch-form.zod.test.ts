import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { createBranchSchema } from "@/schemas/branches/branch-form.zod";

const messages = enDictionary.branches.form.validation;
const valid = {
  brand_id: "b1",
  name_en: "Downtown",
  name_ar: "وسط المدينة",
  email: "downtown@example.test",
  password: "a-secure-password",
  universe: "unisex",
  description_en: "",
  description_ar: "",
  address_en: "",
  address_ar: "",
  latitude: "",
  longitude: "",
};

describe("branch form schema", () => {
  const create = createBranchSchema(messages, true);
  const edit = createBranchSchema(messages, false);

  it("accepts a complete form and trims names", () => {
    expect(create.parse({ ...valid, name_en: "  Downtown " }).name_en).toBe("Downtown");
  });

  it("requires both names, a valid email and a brand", () => {
    expect(create.safeParse({ ...valid, name_ar: " " }).success).toBe(false);
    expect(create.safeParse({ ...valid, name_en: "x".repeat(121) }).success).toBe(false);
    expect(create.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(create.safeParse({ ...valid, brand_id: "" }).success).toBe(false);
  });

  it("requires a 12 character password only when creating", () => {
    expect(create.safeParse({ ...valid, password: "" }).success).toBe(false);
    expect(create.safeParse({ ...valid, password: "short" }).success).toBe(false);
    expect(edit.safeParse({ ...valid, password: "" }).success).toBe(true);
    expect(edit.safeParse({ ...valid, password: "short" }).success).toBe(false);
    expect(edit.safeParse({ ...valid, password: "a-new-secure-password" }).success).toBe(true);
  });

  it("validates optional coordinates and enums", () => {
    expect(create.safeParse({ ...valid, latitude: "24.7", longitude: "46.7" }).success).toBe(true);
    expect(create.safeParse({ ...valid, latitude: "91" }).success).toBe(false);
    expect(create.safeParse({ ...valid, longitude: "-181" }).success).toBe(false);
    expect(create.safeParse({ ...valid, universe: "kids" }).success).toBe(false);
  });

  it("limits the description and address like the backend", () => {
    expect(create.safeParse({ ...valid, description_en: "x".repeat(2001) }).success).toBe(false);
    expect(create.safeParse({ ...valid, address_ar: "x".repeat(256) }).success).toBe(false);
  });
});
