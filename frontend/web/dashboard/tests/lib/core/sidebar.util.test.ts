import { describe, expect, it } from "vitest";

import { parseSidebarCookie, serializeSidebarState } from "@/lib/core/sidebar.util";

describe("sidebar cookie", () => {
  it("restores the collapsed state only from the exact collapsed value", () => {
    expect(parseSidebarCookie("1")).toBe(true);
    expect(parseSidebarCookie("0")).toBe(false);
    expect(parseSidebarCookie(undefined)).toBe(false);
    expect(parseSidebarCookie("true")).toBe(false);
  });

  it("round-trips through serialisation", () => {
    expect(parseSidebarCookie(serializeSidebarState(true))).toBe(true);
    expect(parseSidebarCookie(serializeSidebarState(false))).toBe(false);
  });
});
