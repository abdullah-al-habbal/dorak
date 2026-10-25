import { en } from "@/i18n/messages/en.constant";
import { createUpdatePasswordFormSchema } from "@/services/api/dashboard/update-password-form.schema";
import { describe, expect, it } from "vitest";

describe("updatePasswordFormSchema", () => {
  const schema = createUpdatePasswordFormSchema(en.validation);

  it("rejects a confirmation that does not match the new password", () => {
    expect(
      schema.safeParse({
        currentPassword: "current-password",
        password: "a-new-password-12",
        passwordConfirmation: "a-different-password",
      }).success,
    ).toBe(false);
  });

  it("rejects a password shorter than 12 characters", () => {
    expect(
      schema.safeParse({
        currentPassword: "current-password",
        password: "short",
        passwordConfirmation: "short",
      }).success,
    ).toBe(false);
  });

  it("accepts a matching, long-enough password pair", () => {
    expect(
      schema.safeParse({
        currentPassword: "current-password",
        password: "a-new-password-12",
        passwordConfirmation: "a-new-password-12",
      }).success,
    ).toBe(true);
  });
});
