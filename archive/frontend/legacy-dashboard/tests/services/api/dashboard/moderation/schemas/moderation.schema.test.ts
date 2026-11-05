import { describe, expect, it } from "vitest";
import {
  activationReasonFormSchema,
  resolveDisputeFormSchema,
} from "@/services/api/dashboard/moderation/schemas/moderation.schema";

describe("moderation form schemas", () => {
  it("only accepts uphold or remove as a resolution", () => {
    expect(
      resolveDisputeFormSchema.safeParse({ status: "hidden", note: "" })
        .success,
    ).toBe(true);
    expect(
      resolveDisputeFormSchema.safeParse({ status: "disputed", note: "" })
        .success,
    ).toBe(false);
  });

  it("caps note and reason lengths at the API limits", () => {
    expect(
      resolveDisputeFormSchema.safeParse({
        status: "published",
        note: "x".repeat(1001),
      }).success,
    ).toBe(false);
    expect(
      activationReasonFormSchema.safeParse({ reason: "x".repeat(501) }).success,
    ).toBe(false);
  });
});
