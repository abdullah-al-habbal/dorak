import { describe, expect, it } from "vitest";

import { isWebPushSupported } from "@/lib/push/web-push-support.util";

describe("isWebPushSupported", () => {
  it("needs service workers, the Push API and notifications", () => {
    const full = { navigator: { serviceWorker: {} }, PushManager: class {}, Notification: class {} };
    expect(isWebPushSupported(full)).toBe(true);
    expect(isWebPushSupported({ ...full, navigator: {} })).toBe(false);
    expect(isWebPushSupported({ ...full, PushManager: undefined })).toBe(false);
    expect(isWebPushSupported({ ...full, Notification: undefined })).toBe(false);
  });
});
