import { describe, expect, it } from "vitest";
import {
  isDashboardPagedPath,
  isDashboardRouteAllowed,
} from "@/services/api/dashboard/shared/dashboard-path.util";

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
    ["GET", ["branches", "b", "affiliations"]],
    ["POST", ["branches", "b", "affiliations"]],
    ["POST", ["branches", "b", "affiliations", "a", "accept"]],
    ["POST", ["branches", "b", "affiliations", "a", "reject"]],
    ["POST", ["branches", "b", "affiliations", "a", "terminate"]],
    ["GET", ["branches", "b", "job-postings"]],
    ["POST", ["branches", "b", "job-postings"]],
    ["PUT", ["branches", "b", "job-postings", "j"]],
    ["DELETE", ["branches", "b", "job-postings", "j"]],
    ["GET", ["branches", "b", "job-postings", "j", "applications"]],
    [
      "PATCH",
      ["branches", "b", "job-postings", "j", "applications", "x", "status"],
    ],
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
    ["PUT", ["branches", "b", "affiliations", "a"]],
    ["DELETE", ["branches", "b", "affiliations", "a"]],
    ["GET", ["branches", "b", "affiliations", "a", "accept"]],
    ["POST", ["branches", "b", "affiliations", "a", "approve"]],
    ["PATCH", ["branches", "b", "job-postings", "j"]],
    ["POST", ["branches", "b", "job-postings", "j", "applications"]],
    [
      "PUT",
      ["branches", "b", "job-postings", "j", "applications", "x", "status"],
    ],
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

describe("isDashboardPagedPath", () => {
  it.each([
    [["bookings"], true],
    [["overview"], false],
    [["branches", "b", "reviews"], true],
    [["branches", "b", "affiliations"], true],
    [["branches", "b", "job-postings"], true],
    [["branches", "b", "job-postings", "j", "applications"], true],
    [["branches", "b", "floor-plan"], false],
    [["branches", "b"], false],
    [["profile", "notifications"], false],
  ] as [string[], boolean][])("%j -> %s", (path, expected) => {
    expect(isDashboardPagedPath(path)).toBe(expected);
  });
});
