import { notificationHref } from "@/services/api/common/notification-inbox/notification-link.util";
import { describe, expect, it } from "vitest";

describe("notificationHref", () => {
  it("links booking updates to the booking page for admin and manager", () => {
    const notification = {
      type: "booking_update",
      data: { booking_id: "b 1" },
    };

    expect(notificationHref(notification, "manager")).toBe(
      "/manager/bookings/b%201",
    );
    expect(notificationHref(notification, "admin")).toBe(
      "/admin/bookings/b%201",
    );
  });

  it("has no target for the barber portal, which has no bookings page", () => {
    expect(
      notificationHref(
        { type: "booking_update", data: { booking_id: "b-1" } },
        "barber",
      ),
    ).toBeNull();
  });

  it.each(["invite", "application", "review_request"])(
    "has no dashboard target yet for %s",
    (type) => {
      expect(
        notificationHref({ type, data: { booking_id: "b-1" } }, "manager"),
      ).toBeNull();
    },
  );

  it("ignores booking updates without a usable booking id", () => {
    expect(
      notificationHref({ type: "booking_update", data: {} }, "manager"),
    ).toBeNull();
    expect(
      notificationHref(
        { type: "booking_update", data: { booking_id: 5 } },
        "manager",
      ),
    ).toBeNull();
  });
});
