import { isNotificationRouteAllowed } from "@/services/api/common/notification-inbox/notification-inbox-path.util";
import { describe, expect, it } from "vitest";

const ID = "8f14e45f-ceea-467a-9f3b-1c2d3e4f5a6b";

describe("isNotificationRouteAllowed", () => {
  it.each([
    ["GET", ""],
    ["POST", "read-all"],
    ["PATCH", `${ID}/read`],
  ])("allows %s %s", (method, path) => {
    expect(isNotificationRouteAllowed(method, path)).toBe(true);
  });

  it.each([
    ["DELETE", ""],
    ["GET", "read-all"],
    ["PATCH", "read-all"],
    ["PATCH", "abc/read"],
    ["PATCH", `${ID}/read/extra`],
    ["GET", "../secrets"],
  ])("rejects %s %s", (method, path) => {
    expect(isNotificationRouteAllowed(method, path)).toBe(false);
  });
});
