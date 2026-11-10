import { STATUS_SEGMENT } from "@/config/routes.constant";
import { NotificationEvent } from "@/enums/notification-event.enum";

/** D5: the unread count refetches every 60 seconds while the tab is visible. */
export const NOTIFICATION_POLL_MS = 60_000;
export const NOTIFICATION_PER_PAGE = 20;
/** Past this the badge reads "99+". */
export const NOTIFICATION_BADGE_MAX = 99;

/** Booking pushes carry no platform event; they open the bookings list. */
export const BOOKING_NOTIFICATION_TYPE = "booking_update";
export const BOOKINGS_SEGMENT = "bookings";

/** Where an event's record lives, as a portal segment. An empty string is the portal's home. */
export const NOTIFICATION_EVENT_SEGMENT: Record<NotificationEvent, string> = {
  [NotificationEvent.BrandSubmitted]: "brands",
  [NotificationEvent.BarberAwaitingApproval]: "barber-approvals",
  [NotificationEvent.ReviewDisputed]: "reviews",
  [NotificationEvent.BrandApproved]: STATUS_SEGMENT,
  [NotificationEvent.BrandRejected]: STATUS_SEGMENT,
  [NotificationEvent.BrandSuspended]: STATUS_SEGMENT,
  [NotificationEvent.BrandReactivated]: STATUS_SEGMENT,
  [NotificationEvent.BarberApproved]: "",
  [NotificationEvent.BarberRejected]: "",
};
