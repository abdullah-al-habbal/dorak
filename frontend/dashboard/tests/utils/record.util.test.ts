import { describe, expect, it } from "vitest";
import { invertRecord, mapRecord } from "@/utils/record.util";

describe("record helpers", () => {
  it("builds a total record from a key list", () => {
    expect(mapRecord(["a", "b"] as const, (key) => key.toUpperCase())).toEqual({
      a: "A",
      b: "B",
    });
  });

  it("inverts a one-to-one record", () => {
    expect(invertRecord({ manager: "branch", admin: "admin" })).toEqual({
      branch: "manager",
      admin: "admin",
    });
  });
});
