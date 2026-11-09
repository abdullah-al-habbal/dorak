import { describe, expect, it } from "vitest";

import { zodOutcome } from "@tests/helpers/zod-outcome.helper";
import { changePasswordFormSchema } from "@/schemas/change-password-form.zod";
import { passwordPairSchema } from "@/schemas/fields/password-pair.zod";

const MESSAGES = { length: "length", mismatch: "mismatch" };
const STRONG = "a-strong-password";

describe("passwordPairSchema", () => {
  it("accepts a matching pair of 12 or more characters", () => {
    expect(zodOutcome(passwordPairSchema(MESSAGES), { password: STRONG, password_confirmation: STRONG }).success).toBe(true);
  });

  it("reports a short password and a mismatch on their own fields", () => {
    const short = passwordPairSchema(MESSAGES).safeParse({ password: "short", password_confirmation: "short" });
    expect(short.error?.issues.map((issue) => [issue.path.join("."), issue.message])).toEqual([["password", "length"]]);
    const mismatch = passwordPairSchema(MESSAGES).safeParse({ password: STRONG, password_confirmation: `${STRONG}!` });
    expect(mismatch.error?.issues.map((issue) => [issue.path.join("."), issue.message])).toEqual([["password_confirmation", "mismatch"]]);
  });
});

describe("changePasswordFormSchema", () => {
  const schema = changePasswordFormSchema({ current: "current", ...MESSAGES });

  it("requires the current password but accepts any non-empty one", () => {
    expect(zodOutcome(schema, { current_password: "", password: STRONG, password_confirmation: STRONG }).messages).toEqual(["current"]);
    expect(zodOutcome(schema, { current_password: "x", password: STRONG, password_confirmation: STRONG }).success).toBe(true);
  });
});
