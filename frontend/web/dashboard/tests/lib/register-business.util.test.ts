import { describe, expect, it } from "vitest";

import { brandBody, existingOwnerBody, registerBusinessBody } from "@/lib/register-business.util";
import { registerBusinessBodySchema } from "@/schemas/register-business-body.zod";
import { registerExistingBodySchema } from "@/schemas/register-existing-body.zod";
import type { RegisterBusinessFormValues } from "@/types/register-business-form-values.type";

const values: RegisterBusinessFormValues = {
  ownerName: "Nour Owner",
  email: "nour@example.test",
  phone: "",
  password: "a-long-owner-password-1",
  password_confirmation: "a-long-owner-password-1",
  brandNameEn: "Nour Cuts",
  brandNameAr: "نور كتس",
  currency: "USD",
  branchNameEn: "",
  branchNameAr: "",
};

describe("register business request bodies", () => {
  it("sends no phone and no first branch when they are left empty, and passes the route schema", () => {
    const body = registerBusinessBody(values, "");
    expect(body.owner.phone).toBeNull();
    expect(body.brand).toEqual({ name: { en: "Nour Cuts", ar: "نور كتس" }, base_currency_code: "USD" });
    expect(body).not.toHaveProperty("website");
    expect(registerBusinessBodySchema.safeParse(body).success).toBe(true);
  });

  it("sends the first branch only when both names are filled in", () => {
    expect(brandBody({ ...values, branchNameEn: "Main", branchNameAr: "" })).not.toHaveProperty("first_branch");
    expect(brandBody({ ...values, branchNameEn: "Main", branchNameAr: "الرئيسي" }).first_branch).toEqual({ name: { en: "Main", ar: "الرئيسي" } });
  });

  it("passes the honeypot through so the backend can ignore the sign-up", () => {
    expect(registerBusinessBody(values, "http://spam.test")).toMatchObject({ website: "http://spam.test" });
  });

  it("builds the existing-account body and rejects a branch email the page never sends", () => {
    const body = existingOwnerBody({ email: "a@example.test", password: "x", brandNameEn: "A", brandNameAr: "ا", currency: "USD", branchNameEn: "", branchNameAr: "" });
    expect(registerExistingBodySchema.safeParse(body).success).toBe(true);
    const withEmail = { ...body, brand: { ...body.brand, first_branch: { name: { en: "B", ar: "ب" }, email: "b@example.test" } } };
    const parsed = registerExistingBodySchema.parse(withEmail);
    expect(parsed.brand.first_branch).not.toHaveProperty("email");
  });

  it("refuses a short password at the route", () => {
    const body = registerBusinessBody({ ...values, password: "short", password_confirmation: "short" }, "");
    expect(registerBusinessBodySchema.safeParse(body).success).toBe(false);
  });
});
