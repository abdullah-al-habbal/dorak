import { NOTIFICATION_INBOX_ROUTE_RULES } from "@/services/api/common/notification-inbox/notification-inbox-path.constant";
export function isNotificationRouteAllowed(
  method: string,
  path: string,
): boolean {
  return NOTIFICATION_INBOX_ROUTE_RULES.some(
    (rule) => rule.method === method && rule.path.test(path),
  );
}
