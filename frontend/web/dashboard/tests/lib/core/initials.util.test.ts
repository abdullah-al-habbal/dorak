import { describe, expect, it } from "vitest";

import { initialsOf } from "@/lib/core/initials.util";

describe("initialsOf", () => {
  it("builds up to two initials", () => {
    expect(initialsOf("Sara Al Mansour")).toBe("SA");
    expect(initialsOf("sara@dorak.test")).toBe("SD");
    expect(initialsOf("  ")).toBe("?");
  });
});
