import { describe, expect, it } from "vitest";

import { STATUS_SEGMENT } from "@/config/routes.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { NotificationEvent } from "@/enums/notification-event.enum";
import { isNotificationEvent, notificationEvent, notificationHref } from "@/lib/notification-link.util";
import type { DashboardNotification } from "@/types/account/dashboard-notification.type";

function row(type: string, data: Record<string, unknown> = {}): DashboardNotification {
  return { id: "n1", type, title: "t", body: "b", data, created_at: "2026-01-01T00:00:00Z" };
}

describe("notification links", () => {
  it("recognises only known platform events", () => {
    expect(isNotificationEvent(NotificationEvent.BrandSubmitted)).toBe(true);
    expect(isNotificationEvent("nope")).toBe(false);
    expect(isNotificationEvent(undefined)).toBe(false);
    expect(notificationEvent(row("x", { event: "nope" }))).toBeUndefined();
  });

  it("sends each event to the page that holds the record", () => {
    expect(notificationHref(row("x", { event: NotificationEvent.BrandSubmitted }), AuthActor.Admin)).toBe("/dashboard/admin/brands");
    expect(notificationHref(row("x", { event: NotificationEvent.BarberAwaitingApproval }), AuthActor.Admin)).toBe("/dashboard/admin/barber-approvals");
    expect(notificationHref(row("x", { event: NotificationEvent.ReviewDisputed }), AuthActor.Admin)).toBe("/dashboard/admin/reviews");
    expect(notificationHref(row("x", { event: NotificationEvent.BrandApproved }), AuthActor.Owner)).toBe(`/dashboard/owner/${STATUS_SEGMENT}`);
  });

  it("opens the portal home for events without a page", () => {
    expect(notificationHref(row("x", { event: NotificationEvent.BarberApproved }), AuthActor.Barber)).toBe("/dashboard/barber");
  });

  it("opens bookings for a booking push and nothing for an unknown row", () => {
    expect(notificationHref(row("booking_update"), AuthActor.Manager)).toBe("/dashboard/manager/bookings");
    expect(notificationHref(row("other"), AuthActor.Manager)).toBeUndefined();
  });
});
