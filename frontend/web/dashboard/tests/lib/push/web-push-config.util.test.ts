import { describe, expect, it } from "vitest";

import { parseWebPushConfig } from "@/lib/push/web-push-config.util";

const FULL = { apiKey: "key", projectId: "project", messagingSenderId: "123", appId: "1:123:web:abc", vapidKey: "vapid" };

describe("parseWebPushConfig", () => {
  it("returns the Firebase values and the VAPID key when every value is set", () => {
    expect(parseWebPushConfig(FULL)).toEqual({
      firebase: { apiKey: "key", projectId: "project", messagingSenderId: "123", appId: "1:123:web:abc" },
      vapidKey: "vapid",
    });
  });

  it.each(Object.keys(FULL))("is not configured when %s is missing or empty", (key) => {
    expect(parseWebPushConfig({ ...FULL, [key]: undefined })).toBeNull();
    expect(parseWebPushConfig({ ...FULL, [key]: "" })).toBeNull();
  });

  it("is not configured with no values at all", () => {
    expect(parseWebPushConfig({})).toBeNull();
  });
});
