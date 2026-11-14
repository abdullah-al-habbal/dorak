import { describe, expect, it } from "vitest";

import { adminUserToForm, emptyAdminUserForm, formToAdminUserPayload, mapAdminUserSaveError } from "@/lib/admin-user-form.util";
import { EMPTY_BRAND_CREATE_FORM, createFormToBrandPayload, mapBrandCreateError } from "@/lib/brand-create-form.util";
import { brandToEditForm, editFormToBrandPayload, mapBrandEditError } from "@/lib/brand-edit-form.util";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { AdminBrand } from "@/types/admin-brand.type";
import type { AdminUser } from "@/types/admin-user.type";

function validation(fields: Record<string, string[]>): ApiClientError {
  return new ApiClientError({ status: 422, code: "invalid_request", message: "x", fields });
}

describe("admin user form", () => {
  it("starts empty and trims on the way out", () => {
    expect(emptyAdminUserForm()).toEqual({ name_en: "", name_ar: "", email: "" });
    expect(formToAdminUserPayload({ name_en: " Sam ", name_ar: " سام ", email: " a@b.co " })).toEqual({ name: { en: "Sam", ar: "سام" }, email: "a@b.co" });
  });

  it("reads a translated or plain name into the form", () => {
    const base = { id: "1", email: "a@b.co" } as AdminUser;
    expect(adminUserToForm({ ...base, name: { en: "Sam", ar: "سام" } } as AdminUser)).toMatchObject({ name_en: "Sam", name_ar: "سام" });
    expect(adminUserToForm({ ...base, name: "Plain" } as AdminUser)).toMatchObject({ name_en: "Plain", name_ar: "Plain" });
  });

  it("maps dotted backend names to form fields", () => {
    expect(mapAdminUserSaveError(validation({ "name.en": ["Required"], email: ["Taken"] }), "g").fieldErrors).toEqual({ name_en: "Required", email: "Taken" });
    expect(mapAdminUserSaveError(new Error("boom"), "g")).toEqual({ fieldErrors: {}, formError: "g" });
  });
});

describe("brand create form", () => {
  it("builds the create body with the first branch", () => {
    expect(EMPTY_BRAND_CREATE_FORM).toEqual({ name_en: "", name_ar: "", currency: "", branch_en: "", branch_ar: "" });
    expect(createFormToBrandPayload({ name_en: " B ", name_ar: " ب ", currency: " USD ", branch_en: " M ", branch_ar: " م " })).toEqual({
      name: { en: "B", ar: "ب" },
      base_currency_code: "USD",
      first_branch: { name: { en: "M", ar: "م" } },
    });
  });

  it("renames backend fields and keeps unknown ones", () => {
    const mapped = mapBrandCreateError(validation({ "first_branch.name.ar": ["Bad"], base_currency_code: ["Unknown"], other: ["Hm"] }), "g");
    expect(mapped.fieldErrors).toEqual({ branch_ar: "Bad", currency: "Unknown", other: "Hm" });
  });
});

describe("brand edit form", () => {
  it("reads translations and sends blank descriptions as null", () => {
    const brand = { id: "1", name: { en: "B", ar: "ب" }, description: { en: "D", ar: null } } as unknown as AdminBrand;
    expect(brandToEditForm(brand)).toEqual({ name_en: "B", name_ar: "ب", description_en: "D", description_ar: "" });
    expect(editFormToBrandPayload({ name_en: " B ", name_ar: "ب", description_en: "  ", description_ar: " د " })).toEqual({
      name: { en: "B", ar: "ب" },
      description: { en: null, ar: "د" },
    });
  });

  it("maps dotted names to form fields", () => {
    expect(mapBrandEditError(validation({ "description.ar": ["Long"] }), "g").fieldErrors).toEqual({ description_ar: "Long" });
  });
});
