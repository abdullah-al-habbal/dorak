import { describe, expect, it } from "vitest";
import { activationBody } from "@/services/api/dashboard/moderation/moderation.query";

describe("activationBody", () => {
  it("omits an empty activation reason from the request body", () => {
    expect(activationBody({ reason: "  " })).toBeUndefined();
    expect(activationBody({ reason: " Left the shop " })).toEqual({
      reason: "Left the shop",
    });
  });
});
