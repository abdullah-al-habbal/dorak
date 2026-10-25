import {
  requestEmailChangeSchema,
  updateDisplayNameSchema,
  verifyEmailChangeSchema,
} from "@/services/api/dashboard/profile/schemas/account-details.schema";
import { describe, expect, it } from "vitest";

describe("updateDisplayNameSchema", () => {
  it("rejects an empty display name", () => {
    expect(updateDisplayNameSchema.safeParse({ displayName: "" }).success).toBe(
      false,
    );
  });
  it("accepts a non-empty display name", () => {
    expect(
      updateDisplayNameSchema.safeParse({ displayName: "Jane" }).success,
    ).toBe(true);
  });
});

describe("requestEmailChangeSchema", () => {
  it("rejects an invalid email", () => {
    expect(
      requestEmailChangeSchema.safeParse({ email: "not-an-email" }).success,
    ).toBe(false);
  });
  it("accepts a valid email", () => {
    expect(
      requestEmailChangeSchema.safeParse({ email: "jane@example.com" }).success,
    ).toBe(true);
  });
});

describe("verifyEmailChangeSchema", () => {
  it("rejects a code that is not 6 characters", () => {
    expect(verifyEmailChangeSchema.safeParse({ code: "12345" }).success).toBe(
      false,
    );
  });
  it("accepts a 6-character code", () => {
    expect(verifyEmailChangeSchema.safeParse({ code: "123456" }).success).toBe(
      true,
    );
  });
});
