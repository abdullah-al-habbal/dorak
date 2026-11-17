import { BOOKING_NOTIFICATION_TYPE, BOOKINGS_SEGMENT, NOTIFICATION_EVENT_SEGMENT } from "@/config/money-shell/notification.constant";
import { portalRoot } from "@/config/routes.constant";
import {  } from "@/lib/core/parse/enum-value.util";
import type { AuthActor } from "@/enums/access/auth-actor.enum";
import { NotificationEvent } from "@/enums/ui/notification-event.enum";
import { isEnumValue } from "@/lib/core/parse/enum-value.util";
import type { DashboardNotification } from "@/types/account/profile/dashboard-notification.type";


export function isNotificationEvent(value: unknown): value is NotificationEvent {
  return isEnumValue(NotificationEvent, value);
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
