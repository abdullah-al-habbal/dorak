import { ROUTES } from "@/config/routes.constant";
import type { AuthActor } from "@/services/api/auth/auth.types";
import type { INotificationItem } from "@/services/api/notification-inbox.types";

/**
 * Where a notification should open for the viewing actor, or null when no
 * dashboard page exists for it. `invite`, `application` and `review_request`
 * have no target until the affiliation (Task 75), application and two-way
 * review (Task 40) pages exist; the barber portal has no bookings page.
 */
export function notificationHref(
  notification: Pick<INotificationItem, "type" | "data">,
  actor: AuthActor,
): string | null {
  if (notification.type !== "booking_update") return null;
  if (actor !== "admin" && actor !== "manager") return null;

  const bookingId = notification.data.booking_id;
  if (typeof bookingId !== "string" || bookingId === "") return null;

  return `${ROUTES.operations.resource(actor, "bookings")}/${encodeURIComponent(bookingId)}`;
}
