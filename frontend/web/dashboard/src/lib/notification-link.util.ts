import { BOOKING_NOTIFICATION_TYPE, BOOKINGS_SEGMENT, NOTIFICATION_EVENT_SEGMENT } from "@/config/notification.constant";
import { portalRoot } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { NotificationEvent } from "@/enums/notification-event.enum";
import type { DashboardNotification } from "@/types/account/dashboard-notification.type";

const EVENTS = new Set<string>(Object.values(NotificationEvent));

export function isNotificationEvent(value: unknown): value is NotificationEvent {
  return typeof value === "string" && EVENTS.has(value);
}

/** The platform event of a row, when it has one. */
export function notificationEvent(notification: DashboardNotification): NotificationEvent | undefined {
  const event = notification.data.event;
  return isNotificationEvent(event) ? event : undefined;
}

/** The portal page that holds the record, or undefined when the row has no destination. */
export function notificationHref(notification: DashboardNotification, actor: AuthActor): string | undefined {
  const event = notificationEvent(notification);
  const segment = event !== undefined ? NOTIFICATION_EVENT_SEGMENT[event] : notification.type === BOOKING_NOTIFICATION_TYPE ? BOOKINGS_SEGMENT : undefined;
  if (segment === undefined) return undefined;
  return segment === "" ? portalRoot(actor) : `${portalRoot(actor)}/${segment}`;
}
