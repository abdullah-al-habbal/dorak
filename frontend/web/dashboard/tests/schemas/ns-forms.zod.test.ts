import { describe, expect, it } from "vitest";

import { ADMIN_USER_MAX_EMAIL } from "@/config/admin-user.constant";
import { BRAND_MAX_DESCRIPTION } from "@/config/admin-brand.constant";
import { Locale } from "@/enums/locale.enum";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import { createAdminUserSchema } from "@/schemas/platform/admin-user-form.zod";
import { createBrandCreateSchema } from "@/schemas/brands/brand-create-form.zod";
import { createBrandEditSchema } from "@/schemas/brands/brand-edit-form.zod";
import { createRescheduleSchema } from "@/schemas/bookings/reschedule-form.zod";
import { zodOutcome } from "@tests/helpers/zod-outcome.helper";

const en = DICTIONARIES[Locale.En];

describe("admin user form schema", () => {
  const schema = createAdminUserSchema(en.adminUsers.form.validation);
  const valid = { name_en: "Sam", name_ar: "سام", email: "sam@example.com" };

  it("accepts a trimmed valid user", () => {
    expect(schema.parse({ ...valid, name_en: "  Sam ", email: " sam@example.com " })).toEqual(valid);
  });

  it("rejects blank names and bad emails with the dictionary copy", () => {
    expect(zodOutcome(schema, { ...valid, name_en: " " }).messages).toEqual([en.adminUsers.form.validation.name]);
    expect(zodOutcome(schema, { ...valid, email: "nope" }).messages).toEqual([en.adminUsers.form.validation.email]);
    expect(schema.safeParse({ ...valid, email: `${"a".repeat(ADMIN_USER_MAX_EMAIL)}@x.co` }).success).toBe(false);
  });
});

describe("brand create form schema", () => {
  const schema = createBrandCreateSchema(en.ownerBrand.create.validation);
  const valid = { name_en: "B", name_ar: "ب", currency: "USD", branch_en: "Main", branch_ar: "الرئيسي" };

  it("accepts a complete form and needs a currency and both branch names", () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(zodOutcome(schema, { ...valid, currency: "  " }).messages).toEqual([en.ownerBrand.create.validation.currency]);
    expect(zodOutcome(schema, { ...valid, branch_ar: "" }).messages).toEqual([en.ownerBrand.create.validation.branch]);
  });
});

describe("brand edit form schema", () => {
  const schema = createBrandEditSchema(en.adminBrands.edit.validation);

  it("allows empty descriptions but not empty names or long descriptions", () => {
    const valid = { name_en: "B", name_ar: "ب", description_en: "", description_ar: "" };
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, name_ar: "" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, description_en: "x".repeat(BRAND_MAX_DESCRIPTION + 1) }).success).toBe(false);
  });
});

describe("reschedule form schema", () => {
  const schema = createRescheduleSchema(en.bookings.reschedule.validation);

  it("needs valid times with the end after the start", () => {
    expect(schema.safeParse({ starts_at: "2026-11-20T10:00", ends_at: "2026-11-20T11:00" }).success).toBe(true);
    expect(zodOutcome(schema, { starts_at: "2026-11-20T10:00", ends_at: "2026-11-20T10:00" }).messages).toEqual([en.bookings.reschedule.validation.endAfterStart]);
    expect(zodOutcome(schema, { starts_at: "", ends_at: "2026-11-20T10:00" }).messages).toContain(en.bookings.reschedule.validation.start);
  });
});
