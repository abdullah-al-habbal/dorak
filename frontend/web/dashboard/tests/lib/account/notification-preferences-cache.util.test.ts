import { describe, expect, it } from "vitest";

import { withNotificationPreference } from "@/lib/account/notification-preferences-cache.util";

const ALL_ON = { allows_email_notifications: true, allows_push_notifications: true, allows_booking_notifications: true, allows_system_notifications: true };

describe("withNotificationPreference", () => {
  it("sets one switch and leaves the rest", () => {
    expect(withNotificationPreference(ALL_ON, "allows_push_notifications", false)).toEqual({ ...ALL_ON, allows_push_notifications: false });
    expect(ALL_ON.allows_push_notifications).toBe(true);
  });

  it("does nothing before the first load", () => {
    expect(withNotificationPreference(undefined, "allows_email_notifications", false)).toBeUndefined();
  });
});
