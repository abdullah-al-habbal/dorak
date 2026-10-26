import { describe, expect, it } from "vitest";
import { isDashboardRouteAllowed } from "@/services/api/dashboard/shared/dashboard-path.util";

describe("isDashboardRouteAllowed", () => {
  it.each([
    ["GET", ["overview"]],
    ["GET", ["bookings"]],
    ["POST", ["bookings", "walk-in"]],
    ["GET", ["bookings", "booking-1"]],
    ["PATCH", ["bookings", "booking-1"]],
    ["PATCH", ["bookings", "booking-1", "cancel"]],
    ["PATCH", ["bookings", "booking-1", "reschedule"]],
    ["GET", ["bookings", "booking-1", "history"]],
    ["POST", ["bookings", "booking-1", "review"]],
    ...["branches", "chairs", "services", "stylists"].flatMap((root) => [
      ["GET", [root]],
      ["POST", [root]],
      ["GET", [root, "item-1"]],
      ["PUT", [root, "item-1"]],
      ["DELETE", [root, "item-1"]],
    ]),
    ["GET", ["branches", "branch-1", "floor-plan"]],
    ["PATCH", ["branches", "branch-1", "floor-plan"]],
    ["GET", ["branches", "branch-1", "reviews"]],
    ["GET", ["profile"]],
    ["PATCH", ["profile"]],
    ["POST", ["profile", "email", "change"]],
    ["POST", ["profile", "email", "verify"]],
    ["PUT", ["profile", "password"]],
    ["GET", ["profile", "notifications"]],
    ["PATCH", ["profile", "notifications"]],
    ["GET", ["settings"]],
    ["PATCH", ["settings"]],
    ["PATCH", ["stylists", "stylist-1", "activate"]],
    ["PATCH", ["stylists", "stylist-1", "deactivate"]],
  ] as [string, readonly string[]][])("allows %s %s", (method, path) => {
    expect(isDashboardRouteAllowed(method, path)).toBe(true);
  });

  it.each([
    ["DELETE", ["bookings", "booking-1"]],
    ["PUT", ["branches", "branch-1", "floor-plan"]],
    ["DELETE", ["branches", "branch-1", "floor-plan"]],
    ["POST", ["branches", "branch-1", "reviews"]],
    ["GET", ["branches", "branch-1", "secrets"]],
    ["PATCH", ["branches", "branch-1"]],
    ["GET", ["travel-radius"]],
    ["POST", ["profile"]],
    ["PUT", ["profile", "x"]],
    ["POST", ["bookings"]],
    ["GET", ["branches", "../secrets"]],
    ["POST", ["settings"]],
    ["PUT", ["stylists", "stylist-1", "activate"]],
    ["PATCH", ["stylists", "stylist-1", "suspend"]],
    ["POST", ["bookings", "booking-1", "history"]],
  ] as [string, readonly string[]][])("rejects %s %s", (method, path) => {
    expect(isDashboardRouteAllowed(method, path)).toBe(false);
  });
});
