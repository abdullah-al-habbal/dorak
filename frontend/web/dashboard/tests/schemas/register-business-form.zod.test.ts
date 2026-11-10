import { describe, expect, it } from "vitest";

import { existingOwnerFormSchema, registerBusinessFormSchema, verifyCodeFormSchema } from "@/schemas/register-business-form.zod";

const messages = {
  name: "name",
  email: "email",
  brandName: "brand",
  currency: "currency",
  branchName: "branch",
  code: "code",
  password: "password",
  pair: { length: "length", mismatch: "mismatch" },
};
const valid = {
  ownerName: "Nour",
  email: "nour@example.test",
  phone: "",
  password: "a-long-owner-password-1",
  password_confirmation: "a-long-owner-password-1",
  brandNameEn: "Nour Cuts",
  brandNameAr: "نور",
  currency: "USD",
  branchNameEn: "",
  branchNameAr: "",
};

const issues = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  result.error?.issues.map((issue) => `${String(issue.path[0])}:${issue.message}`) ?? [];

describe("register business form", () => {
  it("accepts a complete form", () => {
    expect(registerBusinessFormSchema(messages).safeParse(valid).success).toBe(true);
  });

  it("reports a password mismatch on the confirmation and a short password on the password", () => {
    expect(issues(registerBusinessFormSchema(messages).safeParse({ ...valid, password_confirmation: "different-password-1" }))).toContain("password_confirmation:mismatch");
    expect(issues(registerBusinessFormSchema(messages).safeParse({ ...valid, password: "short", password_confirmation: "short" }))).toContain("password:length");
  });

  it("needs both branch names or neither", () => {
    const schema = registerBusinessFormSchema(messages);
    expect(issues(schema.safeParse({ ...valid, branchNameEn: "Main" }))).toContain("branchNameAr:branch");
    expect(schema.safeParse({ ...valid, branchNameEn: "Main", branchNameAr: "الرئيسي" }).success).toBe(true);
  });

  it("requires a currency and both business names", () => {
    const result = issues(registerBusinessFormSchema(messages).safeParse({ ...valid, currency: "", brandNameEn: " " }));
    expect(result).toEqual(expect.arrayContaining(["currency:currency", "brandNameEn:brand"]));
  });

  it("asks an existing client for a password but not a confirmation", () => {
    const schema = existingOwnerFormSchema(messages);
    expect(schema.safeParse({ email: "a@example.test", password: "x", brandNameEn: "A", brandNameAr: "ا", currency: "USD", branchNameEn: "", branchNameAr: "" }).success).toBe(true);
    expect(issues(schema.safeParse({ email: "a@example.test", password: "", brandNameEn: "A", brandNameAr: "ا", currency: "USD", branchNameEn: "", branchNameAr: "" }))).toContain("password:password");
  });

  it("accepts only a six-digit code", () => {
    const schema = verifyCodeFormSchema("code");
    expect(schema.safeParse({ code: "123456" }).success).toBe(true);
    expect(schema.safeParse({ code: "12345" }).success).toBe(false);
    expect(schema.safeParse({ code: "12345a" }).success).toBe(false);
  });
});
