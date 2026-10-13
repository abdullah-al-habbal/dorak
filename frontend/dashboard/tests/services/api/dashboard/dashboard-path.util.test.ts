import { describe, expect, it } from "vitest";
import { isDashboardRouteAllowed } from "@/services/api/dashboard/dashboard-path.util";

describe("isDashboardRouteAllowed", () => {
  it.each([
    ["GET", ["overview"]],
    ["GET", ["bookings"]],
    ["POST", ["bookings", "walk-in"]],
    ["GET", ["bookings", "booking-1"]],
    ["PATCH", ["bookings", "booking-1"]],
    ["PATCH", ["bookings", "booking-1", "cancel"]],
    ["PATCH", ["bookings", "booking-1", "reschedule"]],
    ...["branches", "chairs", "services", "stylists"].flatMap((root) => [
      ["GET", [root]],
      ["POST", [root]],
      ["GET", [root, "item-1"]],
      ["PUT", [root, "item-1"]],
      ["DELETE", [root, "item-1"]],
    ]),
    ["GET", ["profile"]],
    ["PATCH", ["profile"]],
    ["POST", ["profile", "email", "change"]],
    ["POST", ["profile", "email", "verify"]],
    ["PUT", ["profile", "password"]],
    ["GET", ["profile", "notifications"]],
    ["PATCH", ["profile", "notifications"]],
  ] as [string, readonly string[]][])("allows %s %s", (method, path) => {
    expect(isDashboardRouteAllowed(method, path)).toBe(true);
  });

  it.each([
    ["DELETE", ["bookings", "booking-1"]],
    ["PATCH", ["branches", "branch-1"]],
    ["GET", ["travel-radius"]],
    ["POST", ["profile"]],
    ["PUT", ["profile", "x"]],
    ["POST", ["bookings"]],
    ["GET", ["branches", "../secrets"]],
  ] as [string, readonly string[]][])("rejects %s %s", (method, path) => {
    expect(isDashboardRouteAllowed(method, path)).toBe(false);
  });
});
