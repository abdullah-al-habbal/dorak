import { isDashboardResourcePath } from "@/services/api/dashboard/dashboard-path.util";
import { describe, expect, it } from "vitest";

describe("isDashboardResourcePath", () => {
  it("allows documented dashboard resources, profile actions, and booking actions", () => {
    expect(isDashboardResourcePath(["branches"])).toBe(true);
    expect(
      isDashboardResourcePath([
        "branches",
        "5c412b7e-5d22-4f24-a1f2-997e8e342ae8",
      ]),
    ).toBe(true);
    expect(isDashboardResourcePath(["bookings", "walk-in"])).toBe(true);
    expect(isDashboardResourcePath(["bookings", "abc-123", "cancel"])).toBe(
      true,
    );
    expect(isDashboardResourcePath(["profile"])).toBe(true);
    expect(isDashboardResourcePath(["profile", "password"])).toBe(true);
    expect(isDashboardResourcePath(["profile", "notifications"])).toBe(true);
  });

  it("rejects arbitrary backend paths", () => {
    expect(isDashboardResourcePath(["users"])).toBe(false);
    expect(isDashboardResourcePath(["bookings", "abc", "delete-all"])).toBe(
      false,
    );
    expect(isDashboardResourcePath(["branches", "../../secrets"])).toBe(false);
  });
});
